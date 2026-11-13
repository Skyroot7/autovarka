const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const products = JSON.parse(readFileSync(path.join(root, 'lib/productsData.json'), 'utf8'));

// Execute the actual TS modules with an isolated KV and Next data-cache adapter.
// No credentials, live data, filesystem writes or network requests are used.
function fixture({ value = products, production = true, configured = true, authenticated = true, invalidationFails = false } = {}) {
  let now = 1_000_000;
  let fail = false;
  let current = structuredClone(value);
  let reads = 0;
  let writes = 0;
  let fileReads = 0;
  const cachedByEndpoint = new Map();
  const invalidated = [];
  const modules = new Map();
  const env = {
    NODE_ENV: production ? 'production' : 'development',
    ...(configured ? { KV_REST_API_URL: 'isolated-test' } : {}),
    ...(configured === true ? { KV_REST_API_TOKEN: 'test' } : {}),
  };
  const kv = {
    async get(key) {
      assert.equal(key, 'products');
      reads++;
      if (fail) throw new Error('isolated storage outage');
      return structuredClone(current);
    },
    async set(key, data) {
      assert.equal(key, 'products');
      writes++;
      current = structuredClone(data);
    },
  };
  const nextCache = {
    unstable_cache(fn, _keys, options) {
      assert.equal(options.revalidate, 30);
      assert.deepEqual(Array.from(options.tags), ['public-catalog']);
      return async (...args) => {
        const identity = args[0];
        let cached = cachedByEndpoint.get(identity);
        if (cached && now - cached.verifiedAt < 30_000) return structuredClone(cached);
        try {
          cached = await fn(...args);
          cachedByEndpoint.set(identity, cached);
        } catch (error) {
          if (!cached) throw error;
        }
        return structuredClone(cached);
      };
    },
    revalidateTag(tag, options) {
      assert.equal(options.expire, 0);
      invalidated.push(tag);
      if (invalidationFails) throw new Error('isolated cache failure');
      cachedByEndpoint.clear();
    },
    revalidatePath(route) { invalidated.push(route); },
  };
  function load(filename) {
    if (modules.has(filename)) return modules.get(filename).exports;
    const loadedModule = { exports: {} };
    modules.set(filename, loadedModule);
    const js = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    function localRequire(name) {
      if (name === 'server-only') return {};
      if (name === 'react') return { cache: fn => fn };
      if (name === '@vercel/kv') return { kv };
      if (name === 'next/cache') return nextCache;
      if (name === './adminAuth') return { isAdminAuthenticated: async () => authenticated };
      if (name === 'fs/promises') return {
        async readFile() { fileReads++; return JSON.stringify(products); },
      };
      if (name.startsWith('.')) return load(path.resolve(path.dirname(filename), `${name}.ts`));
      return require(name);
    }
    const context = {
      module: loadedModule, exports: loadedModule.exports, require: localRequire, structuredClone, Set,
      Date: class extends Date { static now() { return now; } },
      process: {
        env,
        cwd: () => root,
      },
      console: { error() {}, log() {} },
    };
    vm.runInNewContext(js, context, { filename });
    return loadedModule.exports;
  }
  return {
    catalog: load(path.join(root, 'lib/catalog.ts')),
    actions: () => load(path.join(root, 'lib/productActions.ts')),
    outage() { fail = true; },
    advance(ms) { now += ms; },
    replace(data) { current = structuredClone(data); },
    endpoint(url) { env.KV_REST_API_URL = url; },
    stats: () => ({ reads, writes, fileReads, invalidated }),
  };
}

test('a failed production read never becomes an empty catalog or reads the bundled file', async () => {
  const f = fixture();
  f.outage();
  await assert.rejects(f.catalog.getPublicCatalog(), { name: 'CatalogUnavailableError' });
  assert.equal(f.stats().writes, 0);
  assert.equal(f.stats().fileReads, 0);
});

test('production with missing KV configuration fails closed; local development is read-only', async () => {
  const prod = fixture({ configured: false });
  await assert.rejects(prod.catalog.getPublicCatalog(), { name: 'CatalogUnavailableError' });
  const dev = fixture({ configured: false, production: false });
  const snapshot = await dev.catalog.getPublicCatalog();
  assert.equal(snapshot.source, 'development');
  assert.equal(snapshot.products.length, products.length);
  assert.equal(dev.stats().reads, 0);
  assert.equal(dev.stats().writes, 0);
});

test('partial development KV configuration is an error, not permission to use old bundled data', async () => {
  const f = fixture({ configured: 'partial', production: false });
  await assert.rejects(f.catalog.getPublicCatalog(), { name: 'CatalogUnavailableError' });
  assert.equal(f.stats().fileReads, 0);
});

test('empty live catalog stays empty and is never repopulated from a source file', async () => {
  const f = fixture({ value: [] });
  assert.equal((await f.catalog.getPublicCatalog()).products.length, 0);
  assert.equal(await f.catalog.getProductById(products[0].id), undefined);
  assert.equal(f.stats().writes, 0);
  assert.equal(f.stats().fileReads, 0);
});

test('malformed, null and duplicate product data are rejected before caching', async () => {
  for (const value of [null, {}, [{ ...products[0], price: -1 }], [products[0], products[0]]]) {
    const f = fixture({ value });
    await assert.rejects(f.catalog.getPublicCatalog(), { name: 'CatalogUnavailableError' });
  }
});

test('public reads reuse cache without allowing a caller to mutate the snapshot', async () => {
  const f = fixture();
  const first = await f.catalog.getPublicCatalog();
  first.products[0].price = 0;
  assert.equal((await f.catalog.getPublicCatalog()).products[0].price, products[0].price);
  assert.equal(f.stats().reads, 1);
});

test('concurrent public requests coalesce their underlying storage read', async () => {
  const f = fixture();
  await Promise.all([f.catalog.getPublicCatalog(), f.catalog.getPublicCatalog(), f.catalog.getPublicCatalog()]);
  assert.equal(f.stats().reads, 1);
});

test('cache snapshots cannot leak across backing KV endpoints', async () => {
  const f = fixture();
  await f.catalog.getPublicCatalog();
  f.endpoint('different-isolated-store');
  f.outage();
  await assert.rejects(f.catalog.getPublicCatalog(), { name: 'CatalogUnavailableError' });
  assert.equal(f.stats().reads, 2);
});

test('only a recently verified snapshot may bridge a short outage, never indefinitely', async () => {
  const f = fixture();
  await f.catalog.getPublicCatalog();
  f.outage();
  f.advance(45_000);
  const backup = await f.catalog.getPublicCatalog();
  assert.equal(backup.isFallback, true);
  assert.equal(backup.products.length, products.length);
  f.advance(16_000);
  await assert.rejects(f.catalog.getPublicCatalog(), { name: 'CatalogUnavailableError' });
});

test('a cached miss is rechecked against live KV before authorizing a missing-product result', async () => {
  const f = fixture();
  await f.catalog.getPublicCatalog();
  const added = { ...products[0], id: 'new-after-cache' };
  f.replace([...products, added]);
  assert.equal((await f.catalog.getProductById(added.id)).id, added.id);
  f.outage();
  await assert.rejects(f.catalog.getProductById('unknown'), { name: 'CatalogUnavailableError' });
});

test('admin writes read live data and expire public data only after a successful save', async () => {
  const f = fixture();
  await f.catalog.getPublicCatalog();
  const current = structuredClone(products);
  current[1].price += 10;
  f.replace(current);
  const result = await f.actions().updateProduct(products[0].id, { price: products[0].price + 5 });
  assert.equal(result.success, true);
  assert.equal(f.stats().writes, 1);
  assert.ok(f.stats().invalidated.includes('public-catalog'));
  const saved = await f.catalog.getPublicCatalog();
  assert.equal(saved.products[0].price, products[0].price + 5);
  assert.equal(saved.products[1].price, current[1].price);
});

test('admin writes cannot use a backup or proceed without authorization', async () => {
  const f = fixture();
  await f.catalog.getPublicCatalog();
  f.outage();
  assert.equal((await f.actions().updateProduct(products[0].id, { price: 1 })).success, false);
  assert.equal(f.stats().writes, 0);
  await assert.rejects(f.actions().getAdminProducts(), { name: 'CatalogUnavailableError' });
  const anonymous = fixture({ authenticated: false });
  assert.equal((await anonymous.actions().deleteProduct(products[0].id)).success, false);
  assert.equal(anonymous.stats().reads, 0);
  assert.equal(anonymous.stats().writes, 0);
});

test('a cache invalidation failure cannot turn a committed product save into a failed action', async () => {
  const f = fixture({ invalidationFails: true });
  const result = await f.actions().updateProduct(products[0].id, { price: products[0].price + 5 });
  assert.equal(result.success, true);
  assert.equal(f.stats().writes, 1);
  assert.ok(f.stats().invalidated.includes('/sitemap.xml'));
});
