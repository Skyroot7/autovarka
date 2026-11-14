import 'server-only';

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { kv } from '@vercel/kv';
import { readFile } from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import {
  CATALOG_CACHE_SECONDS, CATALOG_CACHE_TAG, CatalogUnavailableError,
  isRecentSnapshot, validateCatalog, type CatalogSnapshot,
} from './catalogPolicy';

export { CatalogUnavailableError } from './catalogPolicy';
export type { CatalogSnapshot } from './catalogPolicy';

const pendingReads = new Map<string, Promise<CatalogSnapshot>>();

function endpointIdentity(): string {
  // Keep separate development/preview/store bindings out of each other's cache.
  // Hash the endpoint so no URL credentials or query parameters enter cache keys.
  return createHash('sha256').update(process.env.KV_REST_API_URL || '').digest('hex');
}

function hasKvConfiguration(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function readDevelopmentCatalog(): Promise<CatalogSnapshot> {
  const content = await readFile(path.join(process.cwd(), 'lib', 'productsData.json'), 'utf8');
  return {
    products: validateCatalog(JSON.parse(content)),
    verifiedAt: Date.now(),
    source: 'development',
    isFallback: false,
  };
}

// No file fallback and no KV writes on a production read. A checked-in file
// cannot establish the current prices, deletions or stock of a live shop.
export async function readFreshCatalog(): Promise<CatalogSnapshot> {
  if (!hasKvConfiguration()) {
    if (process.env.NODE_ENV !== 'production'
      && !process.env.KV_REST_API_URL && !process.env.KV_REST_API_TOKEN) {
      return readDevelopmentCatalog();
    }
    throw new CatalogUnavailableError();
  }
  const identity = endpointIdentity();
  let pendingRead = pendingReads.get(identity);
  if (!pendingRead) {
    pendingRead = (async () => {
      try {
        const products = validateCatalog(await kv.get('products'));
        return { products, verifiedAt: Date.now(), source: 'kv', isFallback: false } satisfies CatalogSnapshot;
      } catch {
        throw new CatalogUnavailableError();
      }
    })().finally(() => { pendingReads.delete(identity); });
    pendingReads.set(identity, pendingRead);
  }
  // Prevent one caller (including an admin action) from mutating shared data.
  return structuredClone(await pendingRead);
}

const readCachedCatalog = unstable_cache(
  // unstable_cache includes arguments in the cache identity.
  async (identity: string) => {
    void identity;
    return readFreshCatalog();
  },
  ['validated-public-catalog-v1'],
  { revalidate: CATALOG_CACHE_SECONDS, tags: [CATALOG_CACHE_TAG] },
);

export const getPublicCatalog = cache(async (): Promise<CatalogSnapshot> => {
  if (!hasKvConfiguration()) return readFreshCatalog();
  let snapshot: CatalogSnapshot;
  try {
    snapshot = await readCachedCatalog(endpointIdentity());
    // Revalidate restored cache contents as well as live responses.
    snapshot = { ...snapshot, products: validateCatalog(snapshot.products) };
  } catch {
    throw new CatalogUnavailableError();
  }
  // Next may return stale data after a failed background revalidation. Enforce
  // a hard bound outside that cache so it can never remain a silent backup.
  if (!isRecentSnapshot(snapshot, Date.now())) return readFreshCatalog();
  return {
    ...snapshot,
    isFallback: Date.now() - snapshot.verifiedAt >= CATALOG_CACHE_SECONDS * 1000,
  };
});

// A cached snapshot cannot prove that a newly added product does not exist.
// Only a successful live read (or the explicit local development catalog)
// may authorize a missing-product 404.
export const getProductById = cache(async (id: string) => {
  const snapshot = await getPublicCatalog();
  const product = snapshot.products.find(item => item.id === id);
  if (product) return product;
  const current = await readFreshCatalog();
  return current.products.find(item => item.id === id);
});
