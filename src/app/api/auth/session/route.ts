/**
 * Session API Route
 * Returns the current user session if authenticated.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');

        if (!sessionCookie) {
            return NextResponse.json({ user: null });
        }

        const sessionData = JSON.parse(sessionCookie.value);
        const user = sessionData.user || sessionData;

        return NextResponse.json({
            user: {
                id: user.id,
                login: user.login,
                name: user.name,
                avatar_url: user.avatar_url,
            }
        });
    } catch {
        return NextResponse.json({ user: null });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204 });
}
