import AsyncStorage from '@react-native-async-storage/async-storage';
const CACHE_PREFIX = 'dbm.cache.';
const STORAGE_KEY = 'dbm.cache.meta';

type CacheEntry<T> = {
  data: T;
  ts: number;
  ttl: number;
};

type CacheMeta = Record<string, number>;

let memoryCache = new Map<string, CacheEntry<unknown>>();
let metaCache: CacheMeta = {};

/* ── TTL presets (ms) ── */
export const CacheTTL = {
  /** 30 seconds — volatile data (orders, stock, dashboard) */
  SHORT: 30_000,
  /** 1 minute — moderate volatility */
  MEDIUM: 60_000,
  /** 2-5 minutes — products, customers */
  STANDARD: 2 * 60_000,
  /** 5 minutes — stable data (customers detail, reports) */
  LONG: 5 * 60_000,
  /** 10-30 minutes — rarely changing data (categories, suppliers) */
  VERY_LONG: 15 * 60_000,
  /** 10 minutes — default for list caches */
  DEFAULT: 5 * 60_000,
} as const;

async function loadMeta(): Promise<CacheMeta> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) metaCache = JSON.parse(raw);
  } catch {
    metaCache = {};
  }
  return metaCache;
}

async function saveMeta(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(metaCache));
  } catch {
    // ignore
  }
}

export async function initCache(): Promise<void> {
  await loadMeta();
}

/* ── Cache read ── */

function isFresh(entry: CacheEntry<unknown>): boolean {
  return Date.now() - entry.ts < entry.ttl;
}

function isStale(entry: CacheEntry<unknown>, graceMs = 30_000): boolean {
  const age = Date.now() - entry.ts;
  return age >= entry.ttl && age < entry.ttl + graceMs;
}

/** Get cached data. Returns null if expired. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const mem = memoryCache.get(key);
  if (mem && isFresh(mem)) {
    if (__DEV__) console.log(`[CACHE] HIT ${key}`);
    return mem.data as T;
  }

  const ts = metaCache[key];
  if (ts) {
    try {
      const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (raw) {
        const entry: CacheEntry<T> = JSON.parse(raw);
        if (isFresh(entry)) {
          memoryCache.set(key, entry as CacheEntry<unknown>);
          if (__DEV__) console.log(`[CACHE] HIT (persistent) ${key}`);
          return entry.data;
        }
      }
    } catch {
      // ignore
    }
  }
  if (__DEV__) console.log(`[CACHE] MISS ${key}`);
  return null;
}

/** Get cached data even if stale (for stale-while-revalidate). Returns [data, isStale]. */
export async function cacheGetStale<T>(key: string): Promise<[T | null, boolean]> {
  const mem = memoryCache.get(key);
  if (mem) {
    if (isFresh(mem)) return [mem.data as T, false];
    if (isStale(mem)) return [mem.data as T, true];
  }

  const ts = metaCache[key];
  if (ts) {
    try {
      const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (raw) {
        const entry: CacheEntry<T> = JSON.parse(raw);
        if (isFresh(entry)) {
          memoryCache.set(key, entry as CacheEntry<unknown>);
          return [entry.data, false];
        }
        if (isStale(entry)) {
          memoryCache.set(key, entry as CacheEntry<unknown>);
          return [entry.data, true];
        }
      }
    } catch {
      // ignore
    }
  }
  return [null, false];
}

/** Set cache with TTL. */
export async function cacheSet<T>(key: string, data: T, ttlMs: number = CacheTTL.DEFAULT): Promise<void> {
  const entry: CacheEntry<T> = { data, ts: Date.now(), ttl: ttlMs };
  memoryCache.set(key, entry as CacheEntry<unknown>);
  metaCache[key] = entry.ts;
  try {
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
    await saveMeta();
  } catch {
    // ignore
  }
}

/* ── Cache invalidation ── */

/** Remove a single cache key from memory + AsyncStorage. */
export async function cacheClearKey(key: string): Promise<void> {
  memoryCache.delete(key);
  delete metaCache[key];
  try {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    await saveMeta();
  } catch {
    // ignore
  }
}

/** Synchronous memory-only clear (for hot paths). Persistent entry cleaned async. */
export function cacheClearKeySync(key: string): void {
  memoryCache.delete(key);
  delete metaCache[key];
  AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`).catch(() => {});
  saveMeta().catch(() => {});
}

/** Remove all cache entries matching a prefix pattern. E.g. cacheClearPattern("products:list") */
export async function cacheClearPattern(pattern: string): Promise<void> {
  const toRemove: string[] = [];
  for (const key of memoryCache.keys()) {
    if (key.startsWith(pattern)) {
      memoryCache.delete(key);
      toRemove.push(key);
    }
  }
  for (const key of Object.keys(metaCache)) {
    if (key.startsWith(pattern)) {
      delete metaCache[key];
      if (!toRemove.includes(key)) toRemove.push(key);
    }
  }
  if (toRemove.length) {
    try {
      await AsyncStorage.multiRemove(toRemove.map((k) => `${CACHE_PREFIX}${k}`));
      await saveMeta();
    } catch {
      // ignore
    }
  }
  if (__DEV__ && toRemove.length) {
    console.log(`[CACHE] PATTERN CLEAR "${pattern}" → ${toRemove.length} entries`);
  }
}

export async function cacheClearAll(): Promise<void> {
  memoryCache.clear();
  metaCache = {};
  try {
    const keys: string[] = [];
    const allKeys = await AsyncStorage.getAllKeys();
    for (let i = 0; i < allKeys.length; i++) {
      const k = allKeys[i];
      if (k.startsWith(CACHE_PREFIX) || k === STORAGE_KEY) keys.push(k);
    }
    if (keys.length) await AsyncStorage.multiRemove(keys);
  } catch {
    // ignore
  }
}

/* ── Domain invalidation helpers ── */

export function invalidateProductCache(): void {
  cacheClearPattern('products:');
  cacheClearPattern('categories:');
  cacheClearPattern('dashboard:');
}

export function invalidateStockCache(): void {
  cacheClearPattern('products:');
  cacheClearPattern('stock:');
  cacheClearPattern('dashboard:');
}

export function invalidateStockHistoryCache(): void {
  cacheClearPattern('stock:movements');
}

export function invalidateOrderCache(): void {
  cacheClearPattern('orders:');
  cacheClearPattern('dashboard:');
}

export function invalidateCustomerCache(): void {
  cacheClearPattern('customers:');
  cacheClearPattern('dashboard:');
}

export function invalidateCustomerDetailCache(id: string): void {
  cacheClearKey(`customer:${id}`);
  cacheClearPattern('customers:');
}

export function invalidateOrderDetailCache(id: string): void {
  cacheClearKey(`order:${id}`);
  cacheClearPattern('orders:');
}

export function invalidateDebtorsCache(): void {
  cacheClearPattern('debtors:');
}

/** After a payment, invalidate orders + customers + dashboard + debtors */
export function invalidatePaymentCache(): void {
  cacheClearPattern('orders:');
  cacheClearPattern('customers:');
  cacheClearPattern('dashboard:');
  cacheClearPattern('debtors:');
}
