/**
 * User Stats Redis Service
 * Handles persistent storage of user security achievements and counts
 */

import { Redis as UpstashRedis } from '@upstash/redis';
import Redis from 'ioredis';
import { UserStats } from '../security-score'; // Keep this import as UserStats is used

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
                return redisClient; // Return the client here
            } catch (error) {
                console.error('[UserStats] Upstash init failed:', error);
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
            } catch (error) {
                console.error('[UserStats] Redis init failed:', error);
            }
        }
    }

    return redisClient;
}

const STATS_KEY_PREFIX = 'user:stats:';

/**
 * Fetch stats for a specific user ID from Redis
 */
export async function getRedisUserStats(userId: string | number): Promise<UserStats | null> {
    const redis = getRedisClient();
    if (!redis) return null;

    const key = `${STATS_KEY_PREFIX}${userId}`;
    try {
        const data = await redis.get(key);
        if (!data) return null;
        const stats = typeof data === 'string' ? JSON.parse(data) : data;

        // Ensure all required fields exist to satisfy UserStats interface
        return {
            totalScans: 0,
            totalFixes: 0,
            reposScanned: 0,
            vulnerabilitiesFound: 0,
            vulnerabilitiesFixed: 0,
            consecutiveSecureDays: 0,
            scoreHistory: [],
            achievements: [],
            ...stats
        };
    } catch (error) {
        console.error('[UserStats] Error fetching from Redis:', error);
        return null;
    }
}

/**
 * Save stats for a specific user ID to Redis
 */
export async function saveRedisUserStats(userId: string | number, stats: UserStats): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    const key = `${STATS_KEY_PREFIX}${userId}`;
    try {
        if (isUpstash) {
            await (redis as UpstashRedis).set(key, stats);
        } else {
            await (redis as Redis).set(key, JSON.stringify(stats));
        }
    } catch (error) {
        console.error('[UserStats] Error saving to Redis:', error);
    }
}

/**
 * Increment a specific metric for a user
 */
export async function incrementUserMetric(
    userId: string | number,
    metric: keyof Pick<UserStats, 'totalScans' | 'totalFixes' | 'vulnerabilitiesFound' | 'vulnerabilitiesFixed'>,
    amount: number = 1
): Promise<void> {
    let stats = await getRedisUserStats(userId);

    // If stats don't exist, initialize with defaults
    if (!stats) {
        stats = {
            totalScans: 0,
            totalFixes: 0,
            reposScanned: 0,
            vulnerabilitiesFound: 0,
            vulnerabilitiesFixed: 0,
            consecutiveSecureDays: 0,
            scoreHistory: [],
            achievements: [],
        };
    }

    const updated = {
        ...stats,
        [metric]: (stats[metric] || 0) + amount,
        lastScanDate: metric === 'totalScans' ? new Date().toISOString() : stats.lastScanDate
    };

    await saveRedisUserStats(userId, updated);
}
