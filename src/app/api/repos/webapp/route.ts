/**
 * React Repositories API
 * Fetches and filters user repositories to show only React projects
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchUserRepositories } from '@/lib/github/client';
import { detectStack } from '@/lib/github/stack-detector';

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('github_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('[Webapp Repos] Fetching all user repositories...');

        // Fetch all repositories
        const allRepos = await fetchUserRepositories(token);
        console.log(`[Webapp Repos] Found ${allRepos.length} total repositories`);

        // Filter Web application projects in parallel
        console.log('[Webapp Repos] Detecting web application stacks...');
        const repoChecks = await Promise.all(
            allRepos.map(async (repo) => {
                try {
                    const stackInfo = await detectStack(token, repo.owner, repo.name);
                    return {
                        repo,
                        isWebapp: !!stackInfo
                    };
                } catch (error) {
                    console.error(`[Webapp Repos] Failed to check ${repo.owner}/${repo.name}:`, error);
                    return {
                        repo,
                        isWebapp: false
                    };
                }
            })
        );

        // Filter to only web projects
        const webappRepos = repoChecks
            .filter(check => check.isWebapp)
            .map(check => check.repo);

        console.log(`[Webapp Repos] Found ${webappRepos.length} web applications out of ${allRepos.length} repositories`);

        return NextResponse.json({
            repositories: webappRepos,
            totalRepos: allRepos.length,
            webappRepos: webappRepos.length
        });

    } catch (error: any) {
        console.error('[React Repos API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch repositories', details: error.message },
            { status: 500 }
        );
    }
}
