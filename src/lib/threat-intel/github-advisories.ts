/**
 * GitHub Security Advisories Fetcher
 * Free API for npm package vulnerabilities
 */

import { GitHubAdvisory } from './types';
import { getCachedThreatData, setCachedThreatData } from './memory-cache';

const GITHUB_API_BASE = 'https://api.github.com';

export async function fetchReactAdvisories(limit: number = 50): Promise<GitHubAdvisory[]> {
    const cacheKey = `github:advisories:react:${limit}`;
    const cached = await getCachedThreatData(cacheKey);

    if (cached) {
        console.log('[GitHub] Using cached advisories');
        return cached;
    }

    try {
        // GitHub Security Advisories API
        const ecosystems = ['npm'];
        const packages = ['react', 'react-dom', 'next', 'react-router', 'react-router-dom'];
        const allAdvisories: GitHubAdvisory[] = [];

        for (const pkg of packages) {
            const url = `${GITHUB_API_BASE}/advisories?ecosystem=npm&affects=${encodeURIComponent(pkg)}&per_page=20`;

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                },
                signal: AbortSignal.timeout(10000),
            });

            if (!response.ok) {
                console.error(`[GitHub] API error for ${pkg}:`, response.status);
                continue;
            }

            const advisories = await response.json();
            allAdvisories.push(...advisories.map(parseAdvisory));

            // Rate limiting: 60 requests per hour for unauthenticated
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Deduplicate and sort by severity
        const uniqueAdvisories = Array.from(
            new Map(allAdvisories.map(adv => [adv.id, adv])).values()
        ).sort((a, b) => {
            const severityOrder = { CRITICAL: 4, HIGH: 3, MODERATE: 2, LOW: 1 };
            return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
        });

        const result = uniqueAdvisories.slice(0, limit);

        // Cache for 12 hours
        await setCachedThreatData(cacheKey, result, 43200);

        console.log(`[GitHub] Fetched ${result.length} advisories`);
        return result;

    } catch (error: unknown) {
        console.error('[GitHub] Fetch error:', error instanceof Error ? error.message : String(error));
        return [];
    }
}

export async function fetchAdvisoriesForPackage(packageName: string): Promise<GitHubAdvisory[]> {
    const cacheKey = `github:advisory:${packageName}`;
    const cached = await getCachedThreatData(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        const url = `${GITHUB_API_BASE}/advisories?ecosystem=npm&affects=${encodeURIComponent(packageName)}&per_page=100`;

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
            },
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const advisories = await response.json();
        const parsed = advisories.map(parseAdvisory);

        // Cache for 24 hours
        await setCachedThreatData(cacheKey, parsed, 86400);

        return parsed;

    } catch (error: unknown) {
        console.error(`[GitHub] Error fetching advisories for ${packageName}:`, error instanceof Error ? error.message : String(error));
        return [];
    }
}

function parseAdvisory(advisory: any): GitHubAdvisory {
    return {
        id: advisory.ghsa_id,
        summary: advisory.summary,
        description: advisory.description || advisory.summary,
        severity: (advisory.severity || 'MODERATE').toUpperCase() as GitHubAdvisory['severity'],
        publishedAt: advisory.published_at,
        updatedAt: advisory.updated_at,
        withdrawnAt: advisory.withdrawn_at,
        vulnerabilities: advisory.vulnerabilities?.map((v: any) => ({
            package: {
                name: v.package?.name || '',
                ecosystem: v.package?.ecosystem || 'npm',
            },
            vulnerableVersionRange: v.vulnerable_version_range || '*',
            firstPatchedVersion: v.first_patched_version?.identifier,
        })) || [],
        references: advisory.references?.map((r: any) => ({ url: r.url })) || [],
        cvss: advisory.cvss ? {
            score: advisory.cvss.score || 0,
            vectorString: advisory.cvss.vector_string || '',
        } : undefined,
    };
}

export async function searchAdvisoriesByKeyword(keyword: string): Promise<GitHubAdvisory[]> {
    const cacheKey = `github:search:${keyword}`;
    const cached = await getCachedThreatData(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        // Use GitHub's search API for broader keyword matching
        const url = `${GITHUB_API_BASE}/advisories?type=reviewed&per_page=50`;

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
            },
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const advisories = await response.json();

        // Filter by keyword in summary or description
        const filtered = advisories
            .filter((adv: any) => {
                const searchText = `${adv.summary} ${adv.description}`.toLowerCase();
                return searchText.includes(keyword.toLowerCase());
            })
            .map(parseAdvisory);

        // Cache for 6 hours
        await setCachedThreatData(cacheKey, filtered, 21600);

        return filtered;

    } catch (error: unknown) {
        console.error(`[GitHub] Search error for "${keyword}":`, error instanceof Error ? error.message : String(error));
        return [];
    }
}
