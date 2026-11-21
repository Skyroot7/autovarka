import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const origin = new URL(process.env.BASE_URL || 'http://localhost:3600');
const fixture = new URL(process.env.KV_FIXTURE_URL || 'http://127.0.0.1:3601');
for (const url of [origin, fixture]) {
  assert.equal(url.protocol, 'http:');
  assert.ok(['localhost', '127.0.0.1'].includes(url.hostname), 'Only isolated loopback servers are supported');
}
async function stats() {
  const state = await (await fetch(new URL('/__fixture', fixture))).json();
  assert.equal(state.fixture, 'autovarka-hardening-memory-only-v1');
  return state.counts;
}
const before = await stats();
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright-core');
const products = JSON.parse(await readFile(new URL('../lib/productsData.json', import.meta.url), 'utf8'));
const locales = ['uk', 'ru', 'en', 'pl', 'de'];
const site = 'https://autovarka.com.ua';
const localPath = (locale, path) => (locale === 'uk' ? '' : '/' + locale) + path;
const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  const crawl = await browser.newContext({ javaScriptEnabled: false });
  await crawl.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.origin === origin.origin && url.pathname !== '/_next/image' && route.request().method() === 'GET'
      ? route.continue() : route.abort();
  });
  const page = await crawl.newPage();
  for (const locale of locales) {
    for (const path of ['', '/products', '/about', '/contacts', ...products.map(item => '/products/' + item.id)]) {
      const url = localPath(locale, path);
      const response = await page.goto(new URL(url || '/', origin).href, { waitUntil: 'domcontentloaded' });
      assert.equal(response.status(), 200, url);
      assert.equal(await page.locator('html').getAttribute('lang'), locale, url);
      const canonical = site + url;
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), canonical);
      const alternates = await page.locator('link[hreflang]').evaluateAll(tags =>
        Object.fromEntries(tags.map(tag => [tag.hreflang, tag.href])));
      const expected = Object.fromEntries(locales.map(language => [language, site + localPath(language, path)]));
      expected['x-default'] = site + path;
      // DOM URL properties normalize the origin with a trailing slash.
      for (const key of Object.keys(expected)) expected[key] = new URL(expected[key]).href;
      assert.deepEqual(alternates, expected);
      assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'), canonical);
      assert.ok(await page.locator('meta[name="twitter:image"]').count());
      assert.equal(await page.locator('h1').count(), 1);
      assert.doesNotMatch(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
      if (path.startsWith('/products/')) {
        const item = products.find(product => path === '/products/' + product.id);
        const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll(tags =>
          tags.map(tag => JSON.parse(tag.textContent)));
        assert.deepEqual(schemas.map(schema => schema['@type']).sort(), ['BreadcrumbList', 'Organization', 'Product', 'WebSite']);
        const product = schemas.find(schema => schema['@type'] === 'Product');
        assert.equal(product.sku, item.id);
        assert.equal(product.offers.price, item.price);
        assert.equal(product.offers.priceCurrency, 'UAH');
        assert.equal(product.offers.availability, 'https://schema.org/' + (item.inStock ? 'InStock' : 'OutOfStock'));
        assert.equal('mpn' in product, false);
        assert.equal('priceValidUntil' in product.offers, false);
      }
    }
    for (const path of ['/admin', '/admin/analytics', '/admin/videos', '/admin/orders', '/cart', '/profile']) {
      await page.goto(new URL(localPath(locale, path), origin).href, { waitUntil: 'domcontentloaded' });
      for (const name of ['robots', 'googlebot']) {
        assert.match(await page.locator('meta[name="' + name + '"]').getAttribute('content'), /noindex/);
      }
      assert.equal(await page.locator('link[rel=canonical], link[hreflang]').count(), 0);
    }
  }
  await crawl.close();
  const redirect = await fetch(new URL('/uk/products', origin), { redirect: 'manual' });
  assert.equal(redirect.status, 307);
  assert.equal(new URL(redirect.headers.get('location'), origin).pathname, '/products');
  assert.equal((await fetch(new URL('/products', origin), { redirect: 'manual' })).status, 200);
  const robots = await (await fetch(new URL('/robots.txt', origin))).text();
  assert.match(robots, /Disallow: \/api\//);
  assert.doesNotMatch(robots, /Disallow: .*\b(admin|profile|cart)\b/);
  const sitemap = await (await fetch(new URL('/sitemap.xml', origin))).text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.equal(new Set(urls).size, locales.length * (products.length + 4));
  for (const locale of locales) assert.ok(urls.includes(site + localPath(locale, '/products')));
  assert.ok(urls.every(url => !/\/(uk|cart|profile|admin)(\/|$)/.test(url)));

  const context = await browser.newContext();
  await context.route('**/*', route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === origin.origin && url.pathname === '/api/orders') {
      // The admin dashboard fetches a count after login. Fulfil it in the browser.
      return request.method() === 'GET' ? route.fulfill({ json: [] }) : route.abort();
    }
    const allowedWrites = ['/api/auth/login', '/api/analytics', '/api/videos'];
    return url.origin === origin.origin && (request.method() === 'GET' || allowedWrites.includes(url.pathname))
      ? route.continue() : route.abort();
  });
  const admin = await context.newPage();
  assert.equal((await context.request.get(new URL('/api/auth/session', origin).href)).status(), 401);
  for (const path of ['/api/analytics', '/api/videos']) {
    assert.equal((await context.request.post(new URL(path, origin).href, { data: {} })).status(), 401);
  }
  assert.equal((await stats()).writes, before.writes);
  await admin.goto(new URL('/en/admin', origin).href);
  await admin.locator('#username').fill('fixture-admin');
  await admin.locator('#password').fill('fixture-only-password');
  const login = admin.waitForResponse(response => response.url().endsWith('/api/auth/login'));
  await admin.locator('form button[type="submit"]').click();
  assert.equal((await login).status(), 200);
  const cookie = (await context.cookies()).find(value => value.name === 'admin_session');
  assert.ok(cookie?.httpOnly && cookie.secure && cookie.sameSite === 'Strict');
  assert.equal((await context.request.get(new URL('/api/auth/session', origin).href)).status(), 200);
  const fresh = await browser.newContext();
  assert.equal((await fresh.request.get(new URL('/api/auth/session', origin).href)).status(), 401);
  await fresh.close();

  for (const [path, invalid, valid] of [
    ['/api/analytics', { googleAnalyticsId: 'please use an ID', googleTagManagerId: '' }, { googleAnalyticsId: 'G-FIXTURE123', googleTagManagerId: 'GTM-FIXTURE' }],
    ['/api/videos', { homePageVideoUrl: 'https://example.invalid/', homePageVideoTitle: '' }, { homePageVideoUrl: 'https://youtu.be/vnwhJnRX8b4', homePageVideoTitle: 'Fixture video' }],
  ]) {
    const url = new URL(path, origin).href;
    assert.equal((await context.request.post(url, { data: invalid })).status(), 400);
    assert.equal((await context.request.post(url, { data: valid })).status(), 200);
    assert.deepEqual(await (await context.request.get(url)).json(), valid);
  }
  const after = await stats();
  assert.equal(after.sessionWrites - before.sessionWrites, 1);
  assert.equal(after.settingsWrites - before.settingsWrites, 2);
  assert.equal(after.orderAccess, before.orderAccess);
  assert.equal(after.rejected, before.rejected);
  console.log('Five locales, all product schemas, service noindex, robots, sitemap, login and protected settings passed. No order access.');
} finally {
  await browser.close();
}
