/**
 * Logout Handler
 * Clears GitHub token from session
 */

import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Clear the token and session cookies across the root domain using expired dates
    const cookieOptions = {
        domain: '.aeglyn.site',
        path: '/',
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const
    };

    response.cookies.set('github_token', '', cookieOptions);
    response.cookies.set('session', '', cookieOptions);

    return response;
}
