/**
 * GitHub OAuth login handler.
 * Redirects the browser to GitHub's authorize screen using server-side credentials.
 */

import { NextRequest, NextResponse } from 'next/server';

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';

export async function GET(request: NextRequest) {
    const clientId = process.env.GITHUB_CLIENT_ID;

    if (!clientId) {
        return NextResponse.redirect(new URL('/?error=oauth_not_configured', request.url));
    }

    const redirectUri = new URL('/api/auth/callback', request.url).toString();
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: 'repo read:user user:email',
    });

    return NextResponse.redirect(`${GITHUB_AUTHORIZE_URL}?${params.toString()}`);
}