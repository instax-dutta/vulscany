/**
 * Cache Manager for AI Search Results
 * Caches non-sensitive vulnerability knowledge
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

class SimpleCache<T> {
    private cache: Map<string, CacheEntry<T>> = new Map();
    private readonly defaultTTL: number;

    constructor(defaultTTLMs: number = 24 * 60 * 60 * 1000) { // 24 hours default
        this.defaultTTL = defaultTTLMs;
    }

    set(key: string, data: T, ttl?: number): void {
        const now = Date.now();
        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt: now + (ttl || this.defaultTTL)
        });
    }

    get(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    has(key: string): boolean {
        return this.get(key) !== null;
    }

    clear(): void {
        this.cache.clear();
    }

    // Clean up expired entries
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }
}

// Global cache instances
export const searchCache = new SimpleCache<any>(7 * 24 * 60 * 60 * 1000); // 7 days
export const vulnerabilityCache = new SimpleCache<any>(24 * 60 * 60 * 1000); // 24 hours

// Deterministic search queries for caching
export const CACHED_SEARCH_QUERIES = {
    REACT2SHELL: 'react react2shell vulnerability security',
    DANGEROUS_HTML: 'dangerouslySetInnerHTML security risk XSS',
    SSR_INJECTION: 'react ssr injection vulnerability security',
    MARKDOWN_XSS: 'react markdown xss risk sanitization',
    OUTDATED_REACT: 'react version security vulnerabilities CVE',
} as const;

// Hash function for cache keys
export function hashQuery(query: string): string {
    // Simple hash for cache key generation
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
        const char = query.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return `query_${Math.abs(hash).toString(36)}`;
}

// Periodic cleanup (run every hour)
if (typeof window === 'undefined') {
    setInterval(() => {
        searchCache.cleanup();
        vulnerabilityCache.cleanup();
    }, 60 * 60 * 1000);
}
