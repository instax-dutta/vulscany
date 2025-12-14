/**
 * Logout Handler
 * Clears GitHub token from session
 */

import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Clear the token cookie
    response.cookies.delete('github_token');

    return response;
}
