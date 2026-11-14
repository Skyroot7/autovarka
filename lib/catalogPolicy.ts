import type { Product } from './products';

export const CATALOG_CACHE_SECONDS = 30;
export const CATALOG_MAX_AGE_MS = 60_000;
export const CATALOG_CACHE_TAG = 'public-catalog';

export class CatalogUnavailableError extends Error {
  constructor() {
    super('The product catalog is temporarily unavailable.');
    this.name = 'CatalogUnavailableError';
  }
}

export interface CatalogSnapshot {
  products: Product[];
  verifiedAt: number;
  source: 'kv' | 'development';
  isFallback: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Validate external data before it can become the public catalog or a backup.
// An empty, successfully read array is a real catalog, not a signal to reseed KV.
export function validateCatalog(value: unknown): Product[] {
  if (!Array.isArray(value)) throw new CatalogUnavailableError();
  const ids = new Set<string>();
  const textFields = [
    'name', 'nameEn', 'nameRu', 'namePl', 'nameDe',
    'description', 'descriptionEn', 'descriptionRu', 'descriptionPl', 'descriptionDe',
  ];
  for (const product of value) {
    if (!isRecord(product)
      || typeof product.id !== 'string' || product.id.trim() === '' || ids.has(product.id)
      || textFields.some(field => typeof product[field] !== 'string')
      || typeof product.price !== 'number' || !Number.isFinite(product.price) || product.price < 0
      || typeof product.inStock !== 'boolean'
      || !Array.isArray(product.images) || product.images.length === 0
      || product.images.some(image => typeof image !== 'string' || image.trim() === '')
      || !isRecord(product.specifications)) {
      throw new CatalogUnavailableError();
    }
    ids.add(product.id);
  }
  return structuredClone(value) as Product[];
}

export function isRecentSnapshot(snapshot: CatalogSnapshot, now: number): boolean {
  const age = now - snapshot.verifiedAt;
  return Number.isFinite(snapshot.verifiedAt) && age >= 0 && age <= CATALOG_MAX_AGE_MS;
}
