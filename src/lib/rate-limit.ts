/**
 * API Rate Limiter
 * Uses Upstash Redis to prevent API abuse during high-traffic events
 */

import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

/**
 * Check if the request should be rate limited
 * @param request The incoming Next.js request
 * @param limit Max requests per window
 * @param duration window duration in seconds
 */
export async function rateLimit(
    request: NextRequest,
    limit: number = 20,
    duration: number = 60
): Promise<RateLimitResult> {
    // If Redis is not configured, skip rate limiting (fail open for reliability)
    if (!process.env.UPSTASH_REDIS_REST_URL) {
        return { success: true, limit, remaining: limit, reset: Date.now() + duration * 1000 };
    }

    try {
        const ip = request.headers.get('x-forwarded-for') || 'anonymous';
        const key = `rate-limit:${ip}`;

        const [currentRequests] = await redis
            .pipeline()
            .incr(key)
            .expire(key, duration)
            .exec() as [number, number];

        const remaining = Math.max(0, limit - currentRequests);
        const success = currentRequests <= limit;

        return {
            success,
            limit,
            remaining,
            reset: Date.now() + duration * 1000,
        };
    } catch (error) {
        console.error('[RateLimit] Error:', error);
        // Fail open if Redis is down during launch event
        return { success: true, limit, remaining: 1, reset: Date.now() };
    }
}
