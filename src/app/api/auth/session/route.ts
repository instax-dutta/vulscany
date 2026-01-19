/**
 * Session API Route
 * Returns the current user session if authenticated
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

        // Parse session data
        const session = JSON.parse(sessionCookie.value);

        // Return user data (without sensitive info)
        return NextResponse.json({
            user: {
                login: session.login,
                name: session.name,
                avatar_url: session.avatar_url,
            }
        });
    } catch (error) {
        return NextResponse.json({ user: null });
    }
}
