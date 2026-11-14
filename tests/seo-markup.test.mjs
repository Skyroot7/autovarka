import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Compile the existing TypeScript/TSX in memory: no emitted files or new runner.
const loaded = new Map();
function loadSource(filename) {
  const absolute = path.resolve(__dirname, '..', filename);
  if (loaded.has(absolute)) return loaded.get(absolute).exports;
  const source = new Module(absolute);
  source.filename = absolute;
  source.paths = Module._nodeModulePaths(path.dirname(absolute));
  loaded.set(absolute, source);
  const originalRequire = source.require.bind(source);
  source.require = (specifier) => {
    if (specifier.startsWith('.')) {
      const target = path.resolve(path.dirname(absolute), specifier);
      for (const extension of ['.ts', '.tsx']) {
        if (fs.existsSync(target + extension)) {
          return loadSource(path.relative(path.resolve(__dirname, '..'), target + extension));
        }
      }
    }
    return originalRequire(specifier);
  };
  const result = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
    fileName: absolute,
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  source._compile(result.outputText, absolute);
  return source.exports;
}

const { getAbsoluteImageUrl, generateAlternates } = loadSource('lib/seo.ts');
const {
  getProductSchema, getItemListSchema, getOrganizationSchema, getWebSiteSchema,
  getBreadcrumbSchema,
} = loadSource('lib/structuredData.ts');
const StructuredData = loadSource('components/StructuredData.tsx').default;
const [product] = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../lib/productsData.json'), 'utf8'));

function parseSchemas(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
}

test('image URLs preserve absolute Blob URLs and resolve local paths', () => {
  const blob = 'https://example.public.blob.vercel-storage.com/products/photo.jpg';
  assert.equal(getAbsoluteImageUrl(blob), blob);
  assert.equal(getAbsoluteImageUrl('/images/photo.jpg'), 'https://autovarka.com.ua/images/photo.jpg');
  assert.equal(getAbsoluteImageUrl('images/photo.jpg'), 'https://autovarka.com.ua/images/photo.jpg');
  assert.throws(() => getAbsoluteImageUrl('javascript:alert(1)'), TypeError);
  assert.throws(() => getAbsoluteImageUrl('data:image/png;base64,AA'), TypeError);
});

test('Product and ItemList use the same localized destination as canonical', () => {
  for (const locale of ['uk', 'ru', 'en', 'pl', 'de']) {
    const canonical = generateAlternates(locale, `/products/${product.id}`).canonical;
    const schema = getProductSchema(product, locale);
    const item = getItemListSchema([product], locale).itemListElement[0].item;
    assert.equal(schema.url, canonical);
    assert.equal(schema.offers.url, canonical);
    assert.equal(item.url, canonical);
    assert.equal(schema.offers.price, product.price);
    assert.equal(schema.offers.priceCurrency, 'UAH');
  }
});

test('Product and catalog schema preserve Blob photos and out-of-stock status', () => {
  const blob = 'https://example.public.blob.vercel-storage.com/photo.webp';
  const unavailable = { ...product, images: [blob], inStock: false };
  const schema = getProductSchema(unavailable);
  const item = getItemListSchema([unavailable]).itemListElement[0].item;
  assert.deepEqual(schema.image, [blob]);
  assert.equal(item.image, blob);
  assert.equal(schema.offers.availability, 'https://schema.org/OutOfStock');
  assert.equal(item.offers.availability, 'https://schema.org/OutOfStock');
});

test('layout and page JSON-LD all appear in server HTML without duplicate IDs', () => {
  const html = renderToStaticMarkup(React.createElement(React.Fragment, null,
    React.createElement(StructuredData, { data: [getOrganizationSchema(), getWebSiteSchema()] }),
    React.createElement(StructuredData, {
      data: [getProductSchema(product), getBreadcrumbSchema([{ name: product.name, url: `/products/${product.id}` }])],
    }),
  ));
  assert.deepEqual(parseSchemas(html).map((schema) => schema['@type']),
    ['Organization', 'WebSite', 'Product', 'BreadcrumbList']);
  assert.doesNotMatch(html, /id="structured-data-/);
});

test('JSON-LD cannot close its script element and preserves original text', () => {
  const value = '</script><script>alert("unsafe")</script>';
  const html = renderToStaticMarkup(React.createElement(StructuredData, {
    data: { '@type': 'Product', name: value },
  }));
  assert.equal((html.match(/<script/g) || []).length, 1);
  assert.equal(parseSchemas(html)[0].name, value);
});

test('a later product render emits its own current commercial data', () => {
  const first = renderToStaticMarkup(React.createElement(StructuredData, { data: getProductSchema(product) }));
  const changed = { ...product, id: 'another-product', price: product.price + 1, inStock: false };
  const second = renderToStaticMarkup(React.createElement(StructuredData, { data: getProductSchema(changed) }));
  assert.equal(parseSchemas(first)[0].sku, product.id);
  assert.equal(parseSchemas(second)[0].sku, changed.id);
  assert.equal(parseSchemas(second)[0].offers.price, changed.price);
  assert.equal(parseSchemas(second)[0].offers.availability, 'https://schema.org/OutOfStock');
});

test('catalog availability guard includes only public home/catalog/product routes', () => {
  const { isCatalogPage } = loadSource('lib/catalogRoutes.ts');
  for (const prefix of ['', '/uk', '/ru', '/en', '/pl', '/de']) {
    for (const suffix of ['', '/', '/products', '/products/item']) {
      assert.equal(isCatalogPage(prefix + suffix), true, prefix + suffix);
    }
    for (const suffix of ['/cart', '/admin', '/admin/orders', '/profile', '/contacts', '/about']) {
      assert.equal(isCatalogPage(prefix + suffix), false, prefix + suffix);
    }
  }
  for (const path of ['/api/orders', '/products-other', '/sitemap.xml', '/fr/products']) {
    assert.equal(isCatalogPage(path), false, path);
  }
});
