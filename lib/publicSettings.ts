import 'server-only';

import { createHash } from 'crypto';
import { kv } from '@vercel/kv';
import { unstable_cache, revalidateTag } from 'next/cache';

const REVALIDATE_SECONDS = 60;
const MAX_AGE_MS = 300_000;

// Only explicitly selected, non-personal settings use this cache. Admin GETs
// call readFresh; sessions, catalog commercial data and orders never enter it.
export function createPublicSettingsReader<T>(key: string, tag: string, validate: (value: unknown) => T, empty: T) {
  async function readFresh(): Promise<T> {
    const value = await kv.get(key);
    return validate(value ?? empty);
  }
  const readCached = unstable_cache(async (identity: string) => {
    void identity;
    return { settings: await readFresh(), verifiedAt: Date.now() };
  }, ['validated-public-settings-v1', key], { revalidate: REVALIDATE_SECONDS, tags: [tag] });

  async function readPublic(): Promise<T> {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return structuredClone(empty);
    const identity = createHash('sha256').update(process.env.KV_REST_API_URL).digest('hex');
    try {
      const snapshot = await readCached(identity);
      const age = Date.now() - snapshot.verifiedAt;
      if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_MS) return await readFresh();
      return validate(snapshot.settings);
    } catch {
      // Optional settings may fail without blocking storefront rendering. Do not
      // cache the fallback or overwrite the source data with an empty value.
      console.error('Public settings are temporarily unavailable:', key);
      return structuredClone(empty);
    }
  }

  return { readFresh, readPublic };
}

export function invalidatePublicSettings(tag: string): void {
  try {
    revalidateTag(tag, { expire: 0 });
  } catch {
    // The write has already succeeded. Do not encourage a duplicate retry.
    console.error('Settings saved, but public cache invalidation failed.');
  }
}
