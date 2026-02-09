/**
 * Redis Cache for Threat Intelligence
 * Supports both standard Redis and Upstash REST API
 * Privacy-compliant caching of public CVE/advisory data only
 */

import { Redis as UpstashRedis } from '@upstash/redis';
import Redis from 'ioredis';

let redisClient: UpstashRedis | Redis | null = null;
let isUpstash = false;

function getRedisClient(): UpstashRedis | Redis | null {
    if (typeof window !== 'undefined') return null; // Client-side guard

    if (!redisClient) {
        // Check for Upstash REST API credentials (preferred for serverless)
        const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
        const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

        if (upstashUrl && upstashToken) {
            try {
                redisClient = new UpstashRedis({
                    url: upstashUrl,
                    token: upstashToken,
                });
                isUpstash = true;
                console.log('[Redis] Connected to Upstash (REST API)');
                return redisClient;
            } catch (error) {
                console.error('[Redis] Upstash initialization failed:', error);
            }
        }

        // Fallback to standard Redis connection
        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
            console.warn('[ThreatIntel] Redis not configured, using in-memory fallback');
            return null;
        }

        try {
            redisClient = new Redis(redisUrl, {
                maxRetriesPerRequest: 3,
                enableReadyCheck: true,
                lazyConnect: true,
            });

            redisClient.on('error', (err) => {
                console.error('[Redis] Connection error:', err.message);
            });

            redisClient.on('connect', () => {
                console.log('[Redis] Connected successfully');
            });

            isUpstash = false;
        } catch (error) {
            console.error('[Redis] Failed to initialize:', error);
            return null;
        }
    }

    return redisClient;
}

// In-memory fallback cache
const memoryCache = new Map<string, { data: any; expiry: number }>();

export async function getCachedThreatData(key: string): Promise<any | null> {
    const redis = getRedisClient();

    if (redis) {
        try {
            const data = await redis.get(key);
            if (!data) return null;

            // Upstash returns parsed JSON automatically, ioredis returns string
            return typeof data === 'string' ? JSON.parse(data) : data;
        } catch (error) {
            console.error('[Redis] Get error:', error);
        }
    }

    // Fallback to memory cache
    const cached = memoryCache.get(key);
    if (cached && cached.expiry > Date.now()) {
        return cached.data;
    }
    return null;
}

/**
 * Get multiple cached items in a single batch
 */
export async function getMultipleCachedThreatData(keys: string[]): Promise<any[]> {
    if (keys.length === 0) return [];

    const redis = getRedisClient();

    if (redis) {
        try {
            // Both ioredis and upstash support mget
            const results = await redis.mget(...keys);

            return results.map(data => {
                if (!data) return null;
                // Upstash returns parsed JSON automatically, ioredis returns string
                try {
                    return typeof data === 'string' ? JSON.parse(data) : data;
                } catch (e) {
                    console.error('[Redis] Parse error for key:', e);
                    return null;
                }
            });
        } catch (error) {
            console.error('[Redis] MGet error:', error);
        }
    }

    // Fallback to memory cache
    return keys.map(key => {
        const cached = memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
            return cached.data;
        }
        return null;
    });
}

export async function setCachedThreatData(
    key: string,
    data: any,
    ttlSeconds: number = 86400 // 24 hours default
): Promise<void> {
    const redis = getRedisClient();

    if (redis) {
        try {
            if (isUpstash) {
                // Upstash handles JSON automatically
                await (redis as UpstashRedis).set(key, data, { ex: ttlSeconds });
            } else {
                // ioredis requires string
                await (redis as Redis).setex(key, ttlSeconds, JSON.stringify(data));
            }
            return;
        } catch (error) {
            console.error('[Redis] Set error:', error);
        }
    }

    // Fallback to memory cache
    memoryCache.set(key, {
        data,
        expiry: Date.now() + ttlSeconds * 1000,
    });
}

export async function deleteCachedThreatData(key: string): Promise<void> {
    const redis = getRedisClient();

    if (redis) {
        try {
            await redis.del(key);
        } catch (error) {
            console.error('[Redis] Delete error:', error);
        }
    }

    memoryCache.delete(key);
}

export async function getCachedKeys(pattern: string): Promise<string[]> {
    const redis = getRedisClient();

    if (redis) {
        try {
            if (isUpstash) {
                // Upstash REST API doesn't support KEYS command efficiently
                // Return empty array for now (could implement SCAN in future)
                console.warn('[Redis] KEYS command not recommended for Upstash, skipping');
                return [];
            } else {
                return await (redis as Redis).keys(pattern);
            }
        } catch (error) {
            console.error('[Redis] Keys error:', error);
        }
    }

    // Fallback: filter memory cache keys
    return Array.from(memoryCache.keys()).filter(k => {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(k);
    });
}

// Cleanup expired memory cache entries
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of memoryCache.entries()) {
        if (value.expiry <= now) {
            memoryCache.delete(key);
        }
    }
}, 3600000); // Every hour
