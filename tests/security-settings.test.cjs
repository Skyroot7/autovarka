const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');
const { pbkdf2Sync } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const validAnalytics = { googleAnalyticsId: 'G-TEST123456', googleTagManagerId: 'GTM-TEST123' };
const validVideo = { homePageVideoUrl: 'https://www.youtube.com/watch?v=vnwhJnRX8b4', homePageVideoTitle: 'Test video' };

// Compile source in memory. Every KV call, session check and Next cache operation
// stays inside this fixture; real credentials, orders and external services are unused.
function fixture({ authenticated = true, env = {}, stored = null } = {}) {
  const environment = { NODE_ENV: 'production', KV_REST_API_URL: 'https://fixture.invalid', KV_REST_API_TOKEN: 'fixture', ...env };
  let value = structuredClone(stored);
  let now = 100000;
  let unavailable = false;
  let invalidationUnavailable = false;
  const writes = [];
  const reads = [];
  const invalidations = [];
  const cacheEntries = new Map();
  const loaded = new Map();
  const kv = {
    async get(key) { reads.push(key); if (unavailable) throw new Error('isolated outage'); return structuredClone(value); },
    async set(...args) { if (unavailable) throw new Error('isolated outage'); writes.push(structuredClone(args)); value = structuredClone(args[1]); },
  };
  function load(relative) {
    const filename = path.resolve(root, relative);
    if (filename.endsWith('.json')) return JSON.parse(fs.readFileSync(filename, 'utf8'));
    if (loaded.has(filename)) return loaded.get(filename).exports;
    const source = { exports: {} };
    loaded.set(filename, source);
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
      fileName: filename,
    }).outputText;
    const localRequire = name => {
      if (name === 'server-only') return {};
      if (name === '@vercel/kv') return { kv };
      if (name === '@/lib/adminAuth') return { isAdminAuthenticated: async () => authenticated };
      if (name === 'react') return { cache: fn => fn };
      if (name === 'next/cache') return {
        unstable_cache(fn, keys, options) {
          assert.equal(options.revalidate, 60);
          return async (...args) => {
            const key = JSON.stringify([keys, args]);
            let entry = cacheEntries.get(key);
            if (!entry || now - entry.verifiedAt >= 60000) {
              try { entry = await fn(...args); cacheEntries.set(key, entry); } catch (error) { if (!entry) throw error; }
            }
            return structuredClone(entry);
          };
        },
        revalidateTag(tag, options) {
          invalidations.push({ tag, options: structuredClone(options) });
          if (invalidationUnavailable) throw new Error('isolated invalidation failure');
          cacheEntries.clear();
        },
      };
      if (name.startsWith('@/') || name.startsWith('.')) {
        let target = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(filename), name);
        if (!path.extname(target)) target += '.ts';
        return load(path.relative(root, target));
      }
      return require(name);
    };
    vm.runInNewContext(compiled, {
      module: source, exports: source.exports, require: localRequire,
      Buffer, URL, SyntaxError, structuredClone,
      Date: class extends Date { static now() { return now; } },
      process: { env: environment },
      console: { error() {} },
    }, { filename });
    return source.exports;
  }
  return {
    load, writes, reads, invalidations,
    replace(next) { value = structuredClone(next); },
    outage() { unavailable = true; },
    invalidationFailure() { invalidationUnavailable = true; },
    advance(ms) { now += ms; },
    endpoint(next) { environment.KV_REST_API_URL = next; },
  };
}
const request = body => ({ async json() { return body; } });

for (const [route, valid, tag, key] of [
  ['app/api/analytics/route.ts', validAnalytics, 'public-analytics-settings', 'analytics_settings'],
  ['app/api/videos/route.ts', validVideo, 'public-video-settings', 'videoSettings'],
]) {
  test(`${route}: an anonymous request cannot parse or write settings`, async () => {
    const f = fixture({ authenticated: false });
    let parsed = false;
    const response = await f.load(route).POST({ async json() { parsed = true; throw new Error('must not parse'); } });
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(parsed, false);
    assert.equal(f.writes.length, 0);
    assert.equal(f.reads.length, 0);
  });
  test(`${route}: invalid JSON cannot write`, async () => {
    const f = fixture();
    const response = await f.load(route).POST({ async json() { throw new SyntaxError('fixture'); } });
    assert.equal(response.status, 400);
    assert.equal(f.writes.length, 0);
  });
  test(`${route}: valid authenticated save preserves values and invalidates only its public cache`, async () => {
    const f = fixture();
    const response = await f.load(route).POST(request(valid));
    assert.equal(response.status, 200);
    assert.deepEqual(f.writes, [[key, valid]]);
    assert.deepEqual(f.invalidations, [{ tag, options: { expire: 0 } }]);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  });
  test(`${route}: a committed save is not reported as failed when invalidation fails`, async () => {
    const f = fixture();
    f.invalidationFailure();
    assert.equal((await f.load(route).POST(request(valid))).status, 200);
    assert.equal(f.writes.length, 1);
  });
  test(`${route}: admin GET reports a storage outage, never a successful empty replacement`, async () => {
    const f = fixture({ stored: valid });
    const api = f.load(route);
    assert.deepEqual(await (await api.GET()).json(), valid);
    f.outage();
    assert.equal((await api.GET()).status, 503);
    assert.equal(f.writes.length, 0);
  });
}

test('analytics rejects script fragments, unknown keys, legacy IDs and wrong types without any write', async () => {
  for (const invalid of [
    { ...validAnalytics, googleAnalyticsId: "G-TEST');globalThis.injected=true;//" },
    { ...validAnalytics, googleTagManagerId: '</script><script>unsafe</script>' },
    { ...validAnalytics, googleAnalyticsId: 'UA-123-1' },
    { ...validAnalytics, googleAnalyticsId: 1 },
    { ...validAnalytics, unexpected: true },
    {}, null, [],
  ]) {
    const f = fixture();
    assert.equal((await f.load('app/api/analytics/route.ts').POST(request(invalid))).status, 400);
    assert.equal(f.writes.length, 0);
  }
});

test('safe analytics scripts configure the same valid ID, and serialization cannot terminate a script', () => {
  const f = fixture();
  const policy = f.load('lib/analyticsPolicy.ts');
  const scripts = policy.getAnalyticsScripts(validAnalytics);
  const context = { dataLayer: [] };
  context.window = context;
  vm.runInNewContext(scripts.ga, context);
  assert.equal(context.dataLayer[1][0], 'config');
  assert.equal(context.dataLayer[1][1], validAnalytics.googleAnalyticsId);
  assert.ok(scripts.gtm.includes(JSON.stringify(validAnalytics.googleTagManagerId)));
  const hostile = '</script>\u2028\u2029"\\';
  const serialized = policy.serializeScriptValue(hostile);
  assert.ok(!serialized.includes('<'));
  assert.equal(JSON.parse(serialized), hostile);
  assert.throws(() => policy.getAnalyticsScripts({ ...validAnalytics, googleAnalyticsId: hostile }), { name: 'SettingsValidationError' });
});

test('video settings only allow exact HTTPS YouTube hosts and valid video IDs', async () => {
  for (const url of ['https://evil.invalid/video', 'https://youtube.com.evil.invalid/watch?v=vnwhJnRX8b4', 'javascript:alert(1)', 'http://youtube.com/watch?v=vnwhJnRX8b4', 'https://user:pass@youtube.com/watch?v=vnwhJnRX8b4', 'https://youtube.com/watch?v=bad']) {
    const f = fixture();
    assert.equal((await f.load('app/api/videos/route.ts').POST(request({ ...validVideo, homePageVideoUrl: url }))).status, 400);
    assert.equal(f.writes.length, 0);
  }
  const policy = fixture().load('lib/videoPolicy.ts');
  for (const url of ['https://youtu.be/vnwhJnRX8b4?t=30', 'https://www.youtube.com/shorts/vnwhJnRX8b4', 'https://www.youtube-nocookie.com/embed/vnwhJnRX8b4']) {
    assert.equal(policy.validateVideoSettings({ ...validVideo, homePageVideoUrl: url }).homePageVideoUrl, url);
  }
  assert.throws(() => policy.validateVideoSettings({ ...validVideo, homePageVideoTitle: 'x'.repeat(201) }), { name: 'SettingsValidationError' });
});

test('public settings reuse bounded endpoint-scoped cache; live admin reads bypass it', async () => {
  const f = fixture({ stored: validAnalytics });
  const settings = f.load('lib/analyticsSettings.ts');
  assert.deepEqual(JSON.parse(JSON.stringify(await settings.getAnalyticsSettings())), validAnalytics);
  await settings.getAnalyticsSettings();
  assert.equal(f.reads.length, 1);
  const changed = { ...validAnalytics, googleAnalyticsId: 'G-CHANGED123' };
  f.replace(changed);
  assert.equal((await settings.readFreshAnalyticsSettings()).googleAnalyticsId, changed.googleAnalyticsId);
  assert.equal((await settings.getAnalyticsSettings()).googleAnalyticsId, validAnalytics.googleAnalyticsId);
  f.endpoint('https://another-fixture.invalid');
  assert.equal((await settings.getAnalyticsSettings()).googleAnalyticsId, changed.googleAnalyticsId);
  f.outage();
  f.advance(61000);
  assert.equal((await settings.getAnalyticsSettings()).googleAnalyticsId, changed.googleAnalyticsId);
  f.advance(300000);
  assert.equal((await settings.getAnalyticsSettings()).googleAnalyticsId, '');
  assert.equal(f.writes.length, 0);
});

test('unconfigured public settings do not attempt storage or invent a tracking ID', async () => {
  const f = fixture({ env: { KV_REST_API_URL: '', KV_REST_API_TOKEN: '' } });
  assert.equal((await f.load('lib/analyticsSettings.ts').getAnalyticsSettings()).googleAnalyticsId, '');
  assert.equal(f.reads.length, 0);
  assert.equal(f.writes.length, 0);
});

const username = 'fixture-admin';
const password = 'fixture password used only in isolated tests';
const salt = 'fixture-salt';
const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
const configuredLogin = { ADMIN_USERNAME: username, ADMIN_PASSWORD_HASH: hash, ADMIN_PASSWORD_SALT: salt };

test('production login fails closed for missing or malformed mandatory configuration even with an explicit plaintext password', async () => {
  for (const env of [
    {}, { ADMIN_USERNAME: username },
    { ...configuredLogin, ADMIN_USERNAME: undefined },
    { ...configuredLogin, ADMIN_PASSWORD_HASH: undefined },
    { ...configuredLogin, ADMIN_PASSWORD_SALT: undefined },
    { ...configuredLogin, ADMIN_PASSWORD_HASH: 'not-a-hash' },
  ]) {
    const f = fixture({ env: { ...env, ADMIN_PASSWORD: password } });
    assert.equal((await f.load('app/api/auth/login/route.ts').POST(request({ username, password }))).status, 503);
    assert.equal(f.writes.length, 0);
  }
});

test('hashed production login retains session cookie attributes and KV session format/TTL', async () => {
  const f = fixture({ env: configuredLogin });
  const response = await f.load('app/api/auth/login/route.ts').POST(request({ username, password }));
  assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /admin_session=[a-f0-9]{64}/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=strict/i);
  assert.match(cookie, /Path=\//);
  assert.match(cookie, /Max-Age=86400/);
  assert.equal(f.writes.length, 1);
  assert.match(f.writes[0][0], /^session:[a-f0-9]{64}$/);
  assert.equal(JSON.parse(f.writes[0][1]).username, username);
  assert.deepEqual(f.writes[0][2], { ex: 86400 });
});

test('invalid login credentials and data never create a session', async () => {
  for (const [body, status] of [
    [{ username, password: 'incorrect' }, 401],
    [{ username: 'different-user', password }, 401],
    [{ username, password: {} }, 400],
    [{ username, password: 'x'.repeat(1025) }, 400],
    [null, 400],
  ]) {
    const f = fixture({ env: configuredLogin });
    assert.equal((await f.load('app/api/auth/login/route.ts').POST(request(body))).status, status);
    assert.equal(f.writes.length, 0);
  }
});

test('development plaintext login requires explicit username/password and never masks a partial hash configuration', async () => {
  const base = { NODE_ENV: 'development', ADMIN_USERNAME: username, ADMIN_PASSWORD: password };
  const configured = fixture({ env: base });
  assert.equal((await configured.load('app/api/auth/login/route.ts').POST(request({ username, password }))).status, 200);
  for (const env of [{ NODE_ENV: 'development' }, { ...base, ADMIN_PASSWORD: undefined }, { ...base, ADMIN_PASSWORD_HASH: hash }]) {
    const f = fixture({ env });
    assert.equal((await f.load('app/api/auth/login/route.ts').POST(request({ username, password }))).status, 503);
    assert.equal(f.writes.length, 0);
  }
});
