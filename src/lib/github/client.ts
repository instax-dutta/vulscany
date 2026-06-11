/**
 * GitHub API Client
 * Handles all GitHub API interactions with privacy-first approach
 */

import { Octokit } from '@octokit/rest';

export interface Repository {
    id: number;
    name: string;
    full_name: string;
    owner: string;
    private: boolean;
    url: string;
    default_branch: string;
    language: string | null;
    isArchived: boolean;
    isFork: boolean;
    updatedAt: string;
}

export interface FileContent {
    name: string;
    path: string;
    content: string;
    sha: string;
}

/**
 * Create GitHub client with access token
 */
export function createGitHubClient(accessToken: string): Octokit {
    return new Octokit({
        auth: accessToken,
        userAgent: 'vulscany/1.0.0',
    });
}

/**
 * Fetch all user repositories with pagination
 */
export async function fetchUserRepositories(
    accessToken: string,
    options: {
        includePrivate?: boolean;
        includeForks?: boolean;
        includeArchived?: boolean;
    } = {}
): Promise<Repository[]> {
    const octokit = createGitHubClient(accessToken);
    const repositories: Repository[] = [];

    const {
        includePrivate = true,
        includeForks = false,
        includeArchived = false
    } = options;

    try {
        // Fetch all repos with pagination
        const iterator = octokit.paginate.iterator(octokit.rest.repos.listForAuthenticatedUser, {
            per_page: 100,
            sort: 'updated',
            direction: 'desc'
        });

        for await (const { data: repos } of iterator) {
            for (const repo of repos) {
                // Apply filters
                if (!includePrivate && repo.private) continue;
                if (!includeForks && repo.fork) continue;
                if (!includeArchived && repo.archived) continue;

                repositories.push({
                    id: repo.id,
                    name: repo.name,
                    full_name: repo.full_name,
                    owner: repo.owner.login,
                    private: repo.private,
                    url: repo.html_url,
                    default_branch: repo.default_branch || 'main',
                    language: repo.language,
                    isArchived: repo.archived,
                    isFork: repo.fork,
                    updatedAt: repo.updated_at || new Date().toISOString()
                });
            }
        }

        return repositories;
    } catch (error: any) {
        console.error('[GitHub] Failed to fetch repositories:', error.message);
        throw new Error('Failed to fetch repositories from GitHub');
    }
}

/**
 * Get file content from repository
 * ⚠️ PRIVACY: Content is processed in memory only, never stored
 */
export async function getFileContent(
    accessToken: string,
    owner: string,
    repo: string,
    path: string,
    ref?: string
): Promise<FileContent | null> {
    const octokit = createGitHubClient(accessToken);

    try {
        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
            ref: ref || undefined
        });

        // Ensure it's a file, not a directory
        if (Array.isArray(data) || data.type !== 'file') {
            return null;
        }

        // Decode base64 content
        const content = Buffer.from(data.content, 'base64').toString('utf-8');

        return {
            name: data.name,
            path: data.path,
            content,
            sha: data.sha
        };
    } catch (error: any) {
        if (error.status === 404) {
            return null; // File doesn't exist
        }
        console.error(`[GitHub] Failed to get file ${path}:`, error.message);
        return null;
    }
}

/**
 * Check if repository has a specific file
 */
export async function hasFile(
    accessToken: string,
    owner: string,
    repo: string,
    path: string
): Promise<boolean> {
    const octokit = createGitHubClient(accessToken);

    try {
        await octokit.rest.repos.getContent({
            owner,
            repo,
            path
        });
        return true;
    } catch (error: any) {
        return false;
    }
}

/**
 * Get directory contents (shallow)
 */
export async function getDirectoryContents(
    accessToken: string,
    owner: string,
    repo: string,
    path: string = ''
): Promise<Array<{ name: string; path: string; type: string; size: number }>> {
    const octokit = createGitHubClient(accessToken);

    try {
        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path
        });

        if (!Array.isArray(data)) {
            return [];
        }

        return data.map(item => ({
            name: item.name,
            path: item.path,
            type: item.type,
            size: item.size || 0
        }));
    } catch (error: any) {
        if (error.status === 404) {
            // Directory doesn't exist - this is common and expected during scanning
            return [];
        }
        console.error(`[GitHub] Failed to get directory ${path}:`, error.message);
        return [];
    }
}

/**
 * Check rate limit status
 */
export async function checkRateLimit(accessToken: string): Promise<{
    limit: number;
    remaining: number;
    reset: Date;
}> {
    const octokit = createGitHubClient(accessToken);

    try {
        const { data } = await octokit.rest.rateLimit.get();

        return {
            limit: data.rate.limit,
            remaining: data.rate.remaining,
            reset: new Date(data.rate.reset * 1000)
        };
    } catch (error: any) {
        console.error('[GitHub] Failed to check rate limit:', error.message);
        throw error;
    }
}
