"use strict";
/**
 * High-performance in-memory TTL cache with namespace invalidation.
 * Reduces database load on serverless PostgreSQL (Neon) and speeds up API response times.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateCache = exports.cacheKeys = exports.apiCache = void 0;
class MemoryCache {
    store = new Map();
    cleanupInterval = null;
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
    get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }
    set(key, value, ttlSeconds = 60) {
        this.store.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
    }
    del(key) {
        this.store.delete(key);
    }
    flushByPrefix(prefix) {
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
            }
        }
    }
    clearAll() {
        this.store.clear();
    }
    evictExpired() {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (now > entry.expiresAt) {
                this.store.delete(key);
            }
        }
    }
}
exports.apiCache = new MemoryCache();
// Helpers for specific data namespaces
exports.cacheKeys = {
    animalsList: (params) => `animals:list:${params}`,
    animalDetail: (idOrSlug) => `animals:detail:${idOrSlug}`,
    publicLedger: (params) => `ledger:public:${params}`,
    stats: `stats:global`,
    settings: `stats:settings`,
};
exports.invalidateCache = {
    animals: () => {
        exports.apiCache.flushByPrefix('animals:');
        exports.apiCache.del(exports.cacheKeys.stats);
    },
    ledger: () => {
        exports.apiCache.flushByPrefix('ledger:');
        exports.apiCache.del(exports.cacheKeys.stats);
        exports.apiCache.flushByPrefix('animals:');
    },
    stats: () => {
        exports.apiCache.del(exports.cacheKeys.stats);
        exports.apiCache.del(exports.cacheKeys.settings);
    },
};
