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

        let response;
        if (!sessionCookie) {
            response = NextResponse.json({ user: null });
        } else {
            // Parse session data
            const session = JSON.parse(sessionCookie.value);

            // Return user data (without sensitive info)
            response = NextResponse.json({
                user: {
                    login: session.login,
                    name: session.name,
                    avatar_url: session.avatar_url,
                }
            });
        }

        // Add CORS headers for the landing page
        response.headers.set('Access-Control-Allow-Origin', 'https://aeglyn.site');
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        return response;
    } catch (error) {
        const response = NextResponse.json({ user: null });
        response.headers.set('Access-Control-Allow-Origin', 'https://aeglyn.site');
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        return response;
    }
}

// Handle preflight requests
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': 'https://aeglyn.site',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
