/**
 * High-performance in-memory TTL cache with namespace invalidation.
 * Reduces database load on serverless PostgreSQL (Neon) and speeds up API response times.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private store: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Run cleanup every 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.evictExpired();
    }, 2 * 60 * 1000);

    // Prevent blocking process shutdown
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  public get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  public set<T>(key: string, value: T, ttlSeconds: number = 60): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  public del(key: string): void {
    this.store.delete(key);
  }

  public flushByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  public clearAll(): void {
    this.store.clear();
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

export const apiCache = new MemoryCache();

// Helpers for specific data namespaces
export const cacheKeys = {
  animalsList: (params: string) => `animals:list:${params}`,
  animalDetail: (idOrSlug: string) => `animals:detail:${idOrSlug}`,
  publicLedger: (params: string) => `ledger:public:${params}`,
  stats: `stats:global`,
  settings: `stats:settings`,
};

export const invalidateCache = {
  animals: () => {
    apiCache.flushByPrefix('animals:');
    apiCache.del(cacheKeys.stats);
  },
  ledger: () => {
    apiCache.flushByPrefix('ledger:');
    apiCache.del(cacheKeys.stats);
    apiCache.flushByPrefix('animals:');
  },
  stats: () => {
    apiCache.del(cacheKeys.stats);
    apiCache.del(cacheKeys.settings);
  },
};
