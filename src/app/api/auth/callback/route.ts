/**
 * GitHub OAuth callback handler
 * Exchanges code for an access token.
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

        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${tokenData.access_token}`,
                'Accept': 'application/json',
                'User-Agent': 'VullScanny/1.0.0'
            }
        });

        const userData = await userResponse.json();

        const { convex, api } = await import('@/lib/convex/client');
        const convexUserId = await convex.mutation(api.users.upsertUser, {
            githubId: userData.id,
            email: userData.email || `${userData.login}@github.placeholder`,
            name: userData.name || userData.login,
            avatarUrl: userData.avatar_url,
        });

        const response = NextResponse.redirect(new URL('/dashboard', request.url));

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 60 * 60 * 2,
            path: '/',
        };

        response.cookies.set('github_token', tokenData.access_token, cookieOptions);
        response.cookies.set('convex_user_id', convexUserId, cookieOptions);
        response.cookies.set('session', JSON.stringify({
            user: {
                id: userData.id,
                login: userData.login,
                name: userData.name || userData.login,
                avatar_url: userData.avatar_url,
            }
        }), cookieOptions);

        return response;
    } catch (error) {
        console.error('[OAuth] Error:', error);
        return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
    }
}
