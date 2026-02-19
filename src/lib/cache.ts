/**
 * Simple in-memory cache with TTL support.
 * Used for reducing database queries on frequently accessed data.
 *
 * Note: In a multi-instance deployment, use Redis or a shared cache instead.
 */

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

class InMemoryCache {
    private store = new Map<string, CacheEntry<unknown>>();
    private readonly maxEntries: number;

    constructor(maxEntries = 100) {
        this.maxEntries = maxEntries;
    }

    /**
     * Get a cached value by key.
     * Returns undefined if the key doesn't exist or has expired.
     */
    get<T>(key: string): T | undefined {
        const entry = this.store.get(key);

        if (!entry) {
            return undefined;
        }

        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return undefined;
        }

        return entry.data as T;
    }

    /**
     * Set a cached value with a TTL in milliseconds.
     * Default TTL is 30 seconds.
     */
    set<T>(key: string, data: T, ttlMs = 30_000): void {
        // Evict oldest entries if cache is full
        if (this.store.size >= this.maxEntries) {
            const firstKey = this.store.keys().next().value;
            if (firstKey) {
                this.store.delete(firstKey);
            }
        }

        this.store.set(key, {
            data,
            expiresAt: Date.now() + ttlMs,
        });
    }

    /**
     * Invalidate a specific cache key.
     */
    invalidate(key: string): void {
        this.store.delete(key);
    }

    /**
     * Invalidate all keys matching a prefix.
     */
    invalidateByPrefix(prefix: string): void {
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
            }
        }
    }

    /**
     * Clear the entire cache.
     */
    clear(): void {
        this.store.clear();
    }

    /**
     * Get the current number of entries in the cache.
     */
    get size(): number {
        return this.store.size;
    }
}

// Singleton cache instance for the application
export const appCache = new InMemoryCache(100);

// Cache key constants
export const CACHE_KEYS = {
    WORKFLOWS_LIST: "workflows:list",
    WORKFLOW_BY_ID: (id: string) => `workflows:${id}`,
    RECENT_RUNS: (limit: number) => `runs:recent:${limit}`,
} as const;

// Cache TTLs in milliseconds
export const CACHE_TTL = {
    WORKFLOWS_LIST: 30_000, // 30 seconds
    WORKFLOW_BY_ID: 60_000, // 1 minute
    RECENT_RUNS: 15_000, // 15 seconds (more dynamic data)
} as const;
