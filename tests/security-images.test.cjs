const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const ownUrl = 'https://ownedstore.public.blob.vercel-storage.com/products/photo.png';

// All Blob/auth adapters are in-memory. Real Sharp validates generated raster
// bytes, while no credentials, live storage or customer data are accessed.
function fixture({ authenticated = true, blobOverrides = {}, sharpAdapter = sharp } = {}) {
  const calls = [];
  const blob = {
    async put(name, bytes, options) {
      calls.push({ method: 'put', name, bytes, options });
      return { url: `https://ownedstore.public.blob.vercel-storage.com/${name}` };
    },
    async head(name) {
      calls.push({ method: 'head', name });
      return { url: ownUrl, pathname: 'products/photo.png', etag: 'original-version' };
    },
    async del(url, options) { calls.push({ method: 'del', url, options }); },
    async list(options) {
      calls.push({ method: 'list', options });
      return { blobs: [
        { pathname: 'products/photo.png', url: ownUrl },
        { pathname: 'private/other.txt', url: 'https://ownedstore.public.blob.vercel-storage.com/private/other.txt' },
      ] };
    },
    ...blobOverrides,
  };
  const modules = new Map();
  function load(filename) {
    if (modules.has(filename)) return modules.get(filename).exports;
    const loaded = { exports: {} };
    modules.set(filename, loaded);
    const js = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    function localRequire(name) {
      if (name === 'server-only') return {};
      if (name === '@vercel/blob') return blob;
      if (name === 'sharp') return sharpAdapter;
      if (name === './adminAuth') return { isAdminAuthenticated: async () => authenticated };
      if (name.startsWith('.')) return load(path.resolve(path.dirname(filename), `${name}.ts`));
      return require(name);
    }
    vm.runInNewContext(js, {
      module: loaded, exports: loaded.exports, require: localRequire,
      Buffer, File, FormData, URL,
      console: { error() {} },
    }, { filename });
    return loaded.exports;
  }
  return {
    actions: load(path.join(root, 'lib/imageActions.ts')),
    policy: load(path.join(root, 'lib/imagePolicy.ts')),
    limits: load(path.join(root, 'lib/imageLimits.ts')),
    calls,
  };
}

function form(bytes, type = 'image/png', name = 'photo.png') {
  const data = new FormData();
  data.set('file', new File([bytes], name, { type }));
  return data;
}

async function raster(format = 'png') {
  return sharp({ create: { width: 8, height: 8, channels: 4, background: '#b16432' } })
    .toFormat(format).toBuffer();
}

test('image actions reject anonymous callers before reading input or touching Blob', async () => {
  const f = fixture({ authenticated: false });
  const hostileInput = { get() { throw new Error('Input must not be read before authentication'); } };
  for (const result of [
    await f.actions.uploadImage(hostileInput),
    await f.actions.deleteImage(ownUrl),
    await f.actions.listImages(),
  ]) {
    assert.equal(result.success, false);
    assert.match(result.error, /авторизація/);
  }
  assert.deepEqual(f.calls, []);
});

test('uploads validate real JPEG/PNG/WebP/GIF pixels and preserve original bytes', async () => {
  const f = fixture();
  for (const [format, type, extension] of [
    ['jpeg', 'image/jpeg', 'jpg'], ['png', 'image/png', 'png'],
    ['webp', 'image/webp', 'webp'], ['gif', 'image/gif', 'gif'],
  ]) {
    const bytes = await raster(format);
    // A deceptive extension is ignored; output extension follows decoded content.
    const result = await f.actions.uploadImage(form(bytes, type, 'untrusted.html'));
    assert.equal(result.success, true, `${format}: ${result.error}`);
    const call = f.calls.at(-1);
    assert.equal(call.method, 'put');
    assert.match(call.name, new RegExp(`^products/product-[a-f0-9-]+\\.${extension}$`));
    assert.deepEqual(call.bytes, bytes);
    assert.equal(call.options.contentType, type);
    assert.equal(call.options.access, 'public');
    assert.equal(call.options.allowOverwrite, false);
  }
});

test('invalid or forged image uploads never reach Blob', async () => {
  const f = fixture();
  const png = await raster();
  const missing = new FormData();
  const textFile = new FormData();
  textFile.set('file', 'not a File');
  for (const data of [
    {}, missing, textFile,
    form(Buffer.alloc(0)),
    form(Buffer.alloc(f.limits.MAX_IMAGE_BYTES + 1)),
    form(png, 'image/svg+xml'),
    form(Buffer.from('<svg onload="untrusted"/>'), 'image/png'),
    form(png, 'image/jpeg'),
    form(png.subarray(0, -8)),
    form(Buffer.concat([png, Buffer.from('<script>untrusted</script>')])),
  ]) {
    const result = await f.actions.uploadImage(data);
    assert.equal(result.success, false);
  }
  assert.deepEqual(f.calls, []);
});

test('dimension/frame limits are checked before raster decoding', async () => {
  const bytes = await raster();
  for (const metadata of [
    { format: 'png', width: 10000, height: 10000 },
    { format: 'png', width: 10, height: 10, pages: 101 },
    { format: 'png', width: 1000, height: 1000, pageHeight: 1000, pages: 41 },
  ]) {
    let decoded = false;
    const f = fixture({ sharpAdapter: () => ({
      async metadata() { return metadata; },
      timeout() { return this; },
      async stats() { decoded = true; },
    }) });
    assert.equal((await f.actions.uploadImage(form(bytes))).success, false);
    assert.equal(decoded, false);
    assert.deepEqual(f.calls, []);
  }
});

test('a decoder failure after valid metadata prevents upload', async () => {
  const f = fixture({ sharpAdapter: () => ({
    async metadata() { return { format: 'png', width: 8, height: 8 }; },
    timeout() { return this; },
    async stats() { throw new Error('Truncated raster after valid headers'); },
  }) });
  assert.equal((await f.actions.uploadImage(form(await raster()))).success, false);
  assert.deepEqual(f.calls, []);
});

test('image deletion rejects forged hosts, credentials, path traversal and non-product resources before Blob access', async () => {
  const f = fixture();
  for (const url of [
    '', null, {},
    'http://ownedstore.public.blob.vercel-storage.com/products/photo.png',
    'https://ownedstore.public.blob.vercel-storage.com.attacker.invalid/products/photo.png',
    'https://ownedstore.public.blob.vercel-storage.com@attacker.invalid/products/photo.png',
    'https://user:pass@ownedstore.public.blob.vercel-storage.com/products/photo.png',
    'https://ownedstore.public.blob.vercel-storage.com:444/products/photo.png',
    'https://ownedstore.public.blob.vercel-storage.com/private/photo.png',
    'https://ownedstore.public.blob.vercel-storage.com/products/../photo.png',
    'https://ownedstore.public.blob.vercel-storage.com/products/%2e%2e/photo.png',
    'https://ownedstore.public.blob.vercel-storage.com/products/photo.png?download=1',
    'https://ownedstore.public.blob.vercel-storage.com/products/photo.png#fragment',
  ]) assert.equal((await f.actions.deleteImage(url)).success, false, String(url));
  assert.deepEqual(f.calls, []);
});

test('another store with the same pathname cannot authorize deletion', async () => {
  const f = fixture();
  const result = await f.actions.deleteImage('https://foreignstore.public.blob.vercel-storage.com/products/photo.png');
  assert.equal(result.success, false);
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].method, 'head');
  assert.equal(f.calls[0].name, 'products/photo.png');
});

test('owned product image deletion uses authenticated pathname lookup and conditional ETag', async () => {
  const f = fixture();
  assert.equal((await f.actions.deleteImage(ownUrl)).success, true);
  assert.deepEqual(f.calls.map(call => call.method), ['head', 'del']);
  assert.equal(f.calls[0].name, 'products/photo.png');
  assert.equal(f.calls[1].url, ownUrl);
  assert.equal(f.calls[1].options.ifMatch, 'original-version');
});

test('missing ownership evidence or Blob errors fail closed without exposing SDK details', async () => {
  for (const head of [
    async () => ({ pathname: 'products/other.png', url: ownUrl, etag: 'v1' }),
    async () => ({ pathname: 'products/photo.png', url: ownUrl }),
    async () => { throw new Error('Provider request includes confidential details'); },
  ]) {
    let deleted = false;
    const f = fixture({ blobOverrides: { head, async del() { deleted = true; } } });
    const result = await f.actions.deleteImage(ownUrl);
    assert.equal(result.success, false);
    assert.doesNotMatch(result.error, /confidential/);
    assert.equal(deleted, false);
  }
});

test('authenticated local asset removal is a non-destructive no-op', async () => {
  const f = fixture();
  for (const url of ['/images/photo.jpg', '/placeholder.svg', '/placeholder.jpg']) {
    assert.equal((await f.actions.deleteImage(url)).success, true);
  }
  assert.deepEqual(f.calls, []);
});

test('image listing is authenticated and scoped to product assets', async () => {
  const f = fixture();
  const result = await f.actions.listImages();
  assert.equal(result.success, true);
  assert.deepEqual(Array.from(result.urls), [ownUrl]);
  assert.equal(f.calls[0].method, 'list');
  assert.equal(f.calls[0].options.prefix, 'products/');
});
