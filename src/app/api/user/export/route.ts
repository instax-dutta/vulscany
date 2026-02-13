/**
 * User Data Export API (GDPR Article 20 - Data Portability)
 * Returns all user data in JSON format for transparency
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { convex, api } from '@/lib/convex/client';

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const convexUserId = cookieStore.get('convex_user_id')?.value;

    if (!convexUserId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userData = await convex.query(api.users.exportUserData, {
            userId: convexUserId as any,
        });

        return NextResponse.json({
            message: 'User data export (GDPR Article 20 compliance)',
            data: userData,
        }, {
            headers: {
                'Content-Disposition': `attachment; filename="aeglyn-export-${Date.now()}.json"`,
                'Content-Type': 'application/json',
            },
        });
    } catch (error: any) {
        console.error('[API] Data export failed:', error);
        return NextResponse.json(
            { error: 'Export failed', message: error.message },
            { status: 500 }
        );
    }
}
