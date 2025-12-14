/**
 * React Repositories API
 * Fetches and filters user repositories to show only React projects
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchUserRepositories } from '@/lib/github/client';
import { detectReactProject } from '@/lib/github/react-detector';

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('github_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('[React Repos] Fetching all user repositories...');

        // Fetch all repositories
        const allRepos = await fetchUserRepositories(token);
        console.log(`[React Repos] Found ${allRepos.length} total repositories`);

        // Filter React projects in parallel
        console.log('[React Repos] Detecting React projects...');
        const repoChecks = await Promise.all(
            allRepos.map(async (repo) => {
                try {
                    const reactInfo = await detectReactProject(token, repo.owner, repo.name);
                    return {
                        repo,
                        isReact: reactInfo?.isReact || false
                    };
                } catch (error) {
                    console.error(`[React Repos] Failed to check ${repo.owner}/${repo.name}:`, error);
                    return {
                        repo,
                        isReact: false
                    };
                }
            })
        );

        // Filter to only React projects
        const reactRepos = repoChecks
            .filter(check => check.isReact)
            .map(check => check.repo);

        console.log(`[React Repos] Found ${reactRepos.length} React projects out of ${allRepos.length} repositories`);

        return NextResponse.json({
            repositories: reactRepos,
            totalRepos: allRepos.length,
            reactRepos: reactRepos.length
        });

    } catch (error: any) {
        console.error('[React Repos API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch repositories', details: error.message },
            { status: 500 }
        );
    }
}
