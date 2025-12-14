/**
 * Repository Scanner API
 * Scans repositories for React vulnerabilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchUserRepositories } from '@/lib/github/client';
import { detectReactProject } from '@/lib/github/react-detector';
import { scanRepository } from '@/lib/scanner';

export async function GET(request: NextRequest) {
    // Get GitHub token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('github_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch repositories
        const repos = await fetchUserRepositories(token, {
            includeForks: false,
            includeArchived: false
        });

        return NextResponse.json({ repositories: repos });

    } catch (error: any) {
        console.error('[API] Failed to fetch repositories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch repositories' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('github_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { owner, repo } = await request.json();

        if (!owner || !repo) {
            return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
        }

        // Detect if it's a React project
        const reactInfo = await detectReactProject(token, owner, repo);

        if (!reactInfo) {
            return NextResponse.json({
                error: 'Not a React project',
                message: 'This repository does not appear to be a React project'
            }, { status: 400 });
        }

        // Scan the repository
        const scanResult = await scanRepository(token, owner, repo, reactInfo);

        return NextResponse.json({ scanResult });

    } catch (error: any) {
        console.error('[API] Scan failed:', error);
        return NextResponse.json(
            { error: 'Scan failed', message: error.message },
            { status: 500 }
        );
    }
}
