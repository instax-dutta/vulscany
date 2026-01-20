/**
 * Scan Results Cache
 * Privacy-compliant caching of scan metadata (NOT source code)
 * 
 * What we cache:
 * - Scan results (vulnerability counts, types, severity)
 * - Repository metadata (name, owner, React version)
 * - Scan timestamps
 * 
 * What we NEVER cache:
 * - Source code
 * - File contents
 * - Code snippets
 * - GitHub tokens
 */

import { Redis as UpstashRedis } from '@upstash/redis';
import Redis from 'ioredis';

let redisClient: UpstashRedis | Redis | null = null;
let isUpstash = false;

function getRedisClient(): UpstashRedis | Redis | null {
    if (typeof window !== 'undefined') return null;

    if (!redisClient) {
        const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
        const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

        if (upstashUrl && upstashToken) {
            try {
                redisClient = new UpstashRedis({
                    url: upstashUrl,
                    token: upstashToken,
                });
                isUpstash = true;
                console.log('[ScanCache] Connected to Upstash');
                return redisClient;
            } catch (error) {
                console.error('[ScanCache] Upstash init failed:', error);
            }
        }

        const redisUrl = process.env.REDIS_URL;
        if (redisUrl) {
            try {
                redisClient = new Redis(redisUrl, {
                    maxRetriesPerRequest: 3,
                    enableReadyCheck: true,
                    lazyConnect: true,
                });
                isUpstash = false;
                console.log('[ScanCache] Connected to Redis');
            } catch (error) {
                console.error('[ScanCache] Redis init failed:', error);
            }
        }
    }

    return redisClient;
}

// In-memory fallback
const memoryCache = new Map<string, { data: any; expiry: number }>();

/**
 * Sanitize scan result for caching (remove code snippets)
 */
function sanitizeScanResult(result: any): any {
    return {
        repoName: result.repoName,
        owner: result.owner,
        scanTimestamp: result.scanTimestamp,
        stackInfo: {
            stack: result.stackInfo?.stack,
            version: result.stackInfo?.version,
            isNextJS: result.stackInfo?.isNextJS,
            hasTypeScript: result.stackInfo?.hasTypeScript,
        },
        vulnerabilities: result.vulnerabilities?.map((v: any) => ({
            id: v.id,
            type: v.type,
            severity: v.severity,
            title: v.title,
            description: v.description,
            file: v.file,
            line: v.line,
            // Include snippet for AI context and mission-critical fixes
            snippet: v.snippet,
            recommendation: v.recommendation,
        })) || [],
        status: result.status,
        summary: result.summary,
        threatIntelligence: result.threatIntelligence,
    };
}

/**
 * Generate cache key for scan result
 * Uses repository ID + commit SHA for uniqueness
 */
function generateScanCacheKey(owner: string, repo: string, commitSha?: string): string {
    const base = `scan:${owner}:${repo}`;
    return commitSha ? `${base}:${commitSha}` : base;
}

/**
 * Cache scan result (sanitized, no source code)
 */
export async function cacheScanResult(
    owner: string,
    repo: string,
    result: any,
    commitSha?: string
): Promise<void> {
    const redis = getRedisClient();
    const key = generateScanCacheKey(owner, repo, commitSha);
    const sanitized = sanitizeScanResult(result);
    const ttl = 3600; // 1 hour

    if (redis) {
        try {
            if (isUpstash) {
                await (redis as UpstashRedis).set(key, sanitized, { ex: ttl });
            } else {
                await (redis as Redis).setex(key, ttl, JSON.stringify(sanitized));
            }
            console.log(`[ScanCache] Cached result for ${owner}/${repo}`);
        } catch (error) {
            console.error('[ScanCache] Cache set error:', error);
        }
    } else {
        // Fallback to memory
        memoryCache.set(key, {
            data: sanitized,
            expiry: Date.now() + ttl * 1000,
        });
    }
}

/**
 * Retrieve cached scan result
 */
export async function getCachedScanResult(
    owner: string,
    repo: string,
    commitSha?: string
): Promise<any | null> {
    const redis = getRedisClient();
    const key = generateScanCacheKey(owner, repo, commitSha);

    if (redis) {
        try {
            const data = await redis.get(key);
            if (!data) return null;

            const result = typeof data === 'string' ? JSON.parse(data) : data;
            console.log(`[ScanCache] Cache hit for ${owner}/${repo}`);
            return result;
        } catch (error) {
            console.error('[ScanCache] Cache get error:', error);
        }
    }

    // Fallback to memory
    const cached = memoryCache.get(key);
    if (cached && cached.expiry > Date.now()) {
        return cached.data;
    }

    return null;
}

/**
 * Invalidate cached scan result
 */
export async function invalidateScanCache(
    owner: string,
    repo: string,
    commitSha?: string
): Promise<void> {
    const redis = getRedisClient();
    const key = generateScanCacheKey(owner, repo, commitSha);

    if (redis) {
        try {
            await redis.del(key);
            console.log(`[ScanCache] Invalidated cache for ${owner}/${repo}`);
        } catch (error) {
            console.error('[ScanCache] Cache delete error:', error);
        }
    }

    memoryCache.delete(key);
}

// Cleanup expired memory cache
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of memoryCache.entries()) {
        if (value.expiry <= now) {
            memoryCache.delete(key);
        }
    }
}, 3600000); // Every hour
