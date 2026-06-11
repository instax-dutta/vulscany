import { NextRequest } from 'next/server';

const ipHits = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

export async function rateLimit(
    request: NextRequest,
    limit: number = 20,
    duration: number = 60
): Promise<RateLimitResult> {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();

    const existing = ipHits.get(ip);
    if (existing && existing.resetAt > now) {
        existing.count++;
        const remaining = Math.max(0, limit - existing.count);
        return {
            success: existing.count <= limit,
            limit,
            remaining,
            reset: existing.resetAt,
        };
    }

    ipHits.set(ip, { count: 1, resetAt: now + duration * 1000 });
    return { success: true, limit, remaining: limit - 1, reset: now + duration * 1000 };
}
