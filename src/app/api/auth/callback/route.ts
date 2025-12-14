/**
 * GitHub OAuth Callback Handler
 * Exchanges code for access token
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/?error=no_code', request.url));
    }

    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code
            })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            return NextResponse.redirect(new URL(`/?error=${tokenData.error}`, request.url));
        }

        // ⚠️ PRIVACY: We DO NOT store this token in a database
        // It's stored only in a session cookie (httpOnly, secure)
        const response = NextResponse.redirect(new URL('/dashboard', request.url));

        // Set secure httpOnly cookie
        response.cookies.set('github_token', tokenData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 2, // 2 hours
            path: '/'
        });

        return response;

    } catch (error) {
        console.error('[OAuth] Error:', error);
        return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
    }
}
