/**
 * User Data Export API (GDPR Article 20 - Data Portability)
 * Returns all user data in JSON format for transparency
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const session = JSON.parse(sessionCookie.value);
        const githubId = session?.user?.id;

        if (!githubId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { exportUserData } = await import('@/lib/local-store');
        const userData = await exportUserData(githubId);

        return NextResponse.json({
            message: 'User data export',
            data: userData,
        }, {
            headers: {
                'Content-Disposition': `attachment; filename="vulscany-export-${Date.now()}.json"`,
                'Content-Type': 'application/json',
            },
        });
    } catch (error: unknown) {
        console.error('[API] Data export failed:', error);
        return NextResponse.json(
            { error: 'Export failed', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
