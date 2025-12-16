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

        // Check cache first (privacy-compliant - no source code cached)
        const { getCachedScanResult, cacheScanResult } = await import('@/lib/cache/scan-cache');
        const cachedResult = await getCachedScanResult(owner, repo);

        if (cachedResult) {
            console.log(`[API] Returning cached scan for ${owner}/${repo}`);
            return NextResponse.json({
                scanResult: cachedResult,
                cached: true,
                cacheTimestamp: cachedResult.scanTimestamp
            });
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

        // Enhance with threat intelligence
        try {
            const { analyzeRepositoryThreats } = await import('@/lib/threat-intel');
            const dependencies = reactInfo.dependencies || {};

            if (Object.keys(dependencies).length > 0) {
                const threatIntel = await analyzeRepositoryThreats(dependencies);

                scanResult.threatIntelligence = {
                    riskScore: threatIntel.riskScore,
                    riskLevel: threatIntel.riskLevel,
                    cveCount: threatIntel.cveMatches.length,
                    advisoryCount: threatIntel.advisoryMatches.length,
                    criticalThreats: threatIntel.cveMatches.filter(c => c.severity === 'CRITICAL').length,
                    recommendations: threatIntel.recommendations,
                };
            }
        } catch (error) {
            console.error('[API] Threat intelligence failed:', error);
            // Continue without threat intel if it fails
        }

        // Cache the result (sanitized - no source code)
        try {
            await cacheScanResult(owner, repo, scanResult);
        } catch (error) {
            console.error('[API] Failed to cache scan result:', error);
            // Continue even if caching fails
        }

        return NextResponse.json({
            scanResult,
            cached: false
        });

    } catch (error: any) {
        console.error('[API] Scan failed:', error);
        return NextResponse.json(
            { error: 'Scan failed', message: error.message },
            { status: 500 }
        );
    }
}
