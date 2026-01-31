/**
 * Repository Scanner API
 * Scans repositories for React vulnerabilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchUserRepositories } from '@/lib/github/client';
import { detectStack } from '@/lib/github/stack-detector';
import { scanRepository } from '@/lib/scanner';
import { rateLimit } from '@/lib/rate-limit';

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

    // Apply rate limiting (e.g., 30 scans per minute per IP)
    const { success, limit, remaining, reset } = await rateLimit(request, 30, 60);
    if (!success) {
        return NextResponse.json(
            { error: 'Too Many Requests', message: 'Rate limit exceeded. Please try again in a minute.' },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': limit.toString(),
                    'X-RateLimit-Remaining': remaining.toString(),
                    'X-RateLimit-Reset': reset.toString(),
                }
            }
        );
    }

    try {
        const { owner, repo, force } = await request.json();

        if (!owner || !repo) {
            return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
        }

        // Check cache first (privacy-compliant - no source code cached)
        const { getCachedScanResult, cacheScanResult, invalidateScanCache } = await import('@/lib/cache/scan-cache');

        // If force is requested, invalidate the cache first
        if (force) {
            console.log(`[API] Force refresh requested for ${owner}/${repo}`);
            await invalidateScanCache(owner, repo);
        }

        const cachedResult = await getCachedScanResult(owner, repo);

        if (cachedResult && !force) {
            console.log(`[API] Returning cached scan for ${owner}/${repo}`);
            return NextResponse.json({
                scanResult: cachedResult,
                cached: true,
                cacheTimestamp: cachedResult.scanTimestamp
            });
        }

        // Detect stack
        const stackInfo = await detectStack(token, owner, repo);

        if (!stackInfo) {
            return NextResponse.json({
                error: 'Not a Web application',
                message: 'This repository does not appear to be a supported web application stack'
            }, { status: 400 });
        }

        // Scan the repository
        const scanResult = await scanRepository(token, owner, repo, stackInfo);

        // Always gather threat intelligence for zero-day detection and effective scanning
        // This data is cached and used to enhance vulnerability detection
        try {
            const { analyzeRepositoryThreats } = await import('@/lib/threat-intel');
            const dependencies = stackInfo.dependencies || {};

            if (Object.keys(dependencies).length > 0) {
                const threatIntel = await analyzeRepositoryThreats(dependencies);

                // Always include threat intelligence data, but mark if it should be displayed
                scanResult.threatIntelligence = {
                    riskScore: threatIntel.riskScore,
                    riskLevel: threatIntel.riskLevel,
                    cveCount: threatIntel.cveMatches.length,
                    advisoryCount: threatIntel.advisoryMatches.length,
                    criticalThreats: threatIntel.cveMatches.filter(c => c.severity === 'CRITICAL').length,
                    recommendations: threatIntel.recommendations,
                    // Only display in UI if vulnerabilities were found in the scan
                    displayInUI: scanResult.vulnerabilities && scanResult.vulnerabilities.length > 0
                };

                console.log(`[API] Threat intel gathered: ${threatIntel.cveMatches.length} CVEs, ${threatIntel.advisoryMatches.length} advisories`);
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
