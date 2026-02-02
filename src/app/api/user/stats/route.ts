/**
 * User Stats API Route
 * Handles fetching and syncing of user security stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRedisUserStats, saveRedisUserStats } from '@/lib/user/stats';
import { UserStats } from '@/lib/security-score';

async function getUserId() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    if (!sessionCookie) return null;

    try {
        const session = JSON.parse(sessionCookie.value);
        return session.id || session.user?.id;
    } catch {
        return null;
    }
}

export async function GET() {
    const userId = await getUserId();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getRedisUserStats(userId);
    return NextResponse.json({ stats });
}

export async function POST(request: NextRequest) {
    const userId = await getUserId();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { stats } = body as { stats: UserStats };

        if (!stats) {
            return NextResponse.json({ error: 'Invalid stats data' }, { status: 400 });
        }

        // Save to Redis
        await saveRedisUserStats(userId, stats);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Stats API] Error updating stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
