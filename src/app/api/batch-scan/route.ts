/**
 * Batch Scan API - Scan multiple repositories
 * Performs vulnerability scans on multiple repos efficiently
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { scanRepository } from '@/lib/scanner';
import { detectStack } from '@/lib/github/stack-detector';
import { rateLimit } from '@/lib/rate-limit';

interface BatchScanRequest {
    repositories: Array<{
        owner: string;
        name: string;
    }>;
}

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('github_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply strict rate limiting for batch ops (10 per minute)
    const { success, limit, remaining, reset } = await rateLimit(request, 10, 60);
    if (!success) {
        return NextResponse.json(
            { error: 'Too Many Requests', message: 'Batch scan limit reached. Please wait a minute.' },
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
        const { repositories }: BatchScanRequest = await request.json();

        if (!repositories || !Array.isArray(repositories) || repositories.length === 0) {
            return NextResponse.json({ error: 'No repositories provided' }, { status: 400 });
        }

        if (repositories.length > 10) {
            return NextResponse.json({ error: 'Maximum 10 repositories allowed per batch' }, { status: 400 });
        }

        // 2. Credit balance check
        const { convex, api } = await import('@/lib/convex/client');
        const convexUserId = cookieStore.get('convex_user_id')?.value;
        const BATCH_COST = repositories.length; // 1 credit per repo in batch

        if (convexUserId) {
            const user = await convex.query(api.users.getById, { userId: convexUserId as any });
            if (user && user.creditBalance < BATCH_COST) {
                return NextResponse.json(
                    { error: 'Payment Required', message: `Insufficient credits for batch scan. Need ${BATCH_COST} credits.` },
                    { status: 402 }
                );
            }

            // Deduct credits upfront
            await convex.mutation(api.users.deductCredits, {
                userId: convexUserId as any,
                amount: BATCH_COST,
                operation: 'batch_scan',
                repoName: `Batch: ${repositories.length} repos`
            });
        }

        console.log(`[Batch Scan] Starting batch scan for ${repositories.length} repositories`);

        // Scan all repositories in parallel for speed
        const scanPromises = repositories.map(async (repo) => {
            try {
                // Detect web app stack
                const stackInfo = await detectStack(token, repo.owner, repo.name);

                if (!stackInfo) {
                    return {
                        repoName: repo.name,
                        owner: repo.owner,
                        error: 'Not a supported web application stack',
                        status: 'skipped'
                    };
                }

                // Scan for vulnerabilities
                const scanResults = await scanRepository(token, repo.owner, repo.name, stackInfo);

                // Determine status
                const criticalCount = scanResults.vulnerabilities.filter(v => v.severity === 'critical').length;
                const highCount = scanResults.vulnerabilities.filter(v => v.severity === 'high').length;

                let status: 'safe' | 'needs-attention' | 'high-risk' = 'safe';
                if (criticalCount > 0 || highCount > 2) {
                    status = 'high-risk';
                } else if (scanResults.vulnerabilities.length > 0) {
                    status = 'needs-attention';
                }

                // Generate summary
                const summary = scanResults.vulnerabilities.length === 0
                    ? 'No security issues detected. Your code looks secure!'
                    : `Found ${scanResults.vulnerabilities.length} security ${scanResults.vulnerabilities.length === 1 ? 'issue' : 'issues'}. ${criticalCount > 0 ? `${criticalCount} critical. ` : ''}Review and address them to secure your application.`;

                // Log scan to Convex scanHistory (metadata only - NO source code)
                if (convexUserId) {
                    try {
                        const vulnerabilities = scanResults.vulnerabilities || [];
                        const criticalFound = vulnerabilities.filter((v: any) => v.severity === 'critical').length;
                        const highFound = vulnerabilities.filter((v: any) => v.severity === 'high').length;
                        const mediumFound = vulnerabilities.filter((v: any) => v.severity === 'medium').length;
                        const lowFound = vulnerabilities.filter((v: any) => v.severity === 'low').length;

                        await convex.mutation(api.scanHistory.create, {
                            userId: convexUserId as any,
                            repoName: `${repo.owner}/${repo.name}`,
                            repoUrl: `https://github.com/${repo.owner}/${repo.name}`,
                            scanType: 'batch',
                            vulnerabilitiesFound: vulnerabilities.length,
                            criticalCount: criticalFound,
                            highCount: highFound,
                            mediumCount: mediumFound,
                            lowCount: lowFound,
                            creditsConsumed: 1, // Already deducted upfront, so this is for tracking
                            scanDurationMs: scanResults.scanDuration || 0,
                        });
                    } catch (error) {
                        console.error(`[Batch Scan] Failed to log scan history for ${repo.name}:`, error);
                    }
                }

                return {
                    repoName: repo.name,
                    owner: repo.owner,
                    scanTimestamp: new Date().toISOString(),
                    stackInfo,
                    vulnerabilities: scanResults.vulnerabilities,
                    status,
                    summary,
                    error: null
                };

            } catch (error: any) {
                console.error(`[Batch Scan] Failed to scan ${repo.owner}/${repo.name}:`, error.message);
                return {
                    repoName: repo.name,
                    owner: repo.owner,
                    error: error.message || 'Scan failed',
                    status: 'error'
                };
            }
        });

        // Wait for all scans to complete
        const results = await Promise.all(scanPromises);

        // Calculate batch statistics
        const successfulScans = results.filter(r => !r.error);
        const totalVulnerabilities = successfulScans.reduce((sum, r: any) => sum + (r.vulnerabilities?.length || 0), 0);
        const criticalIssues = successfulScans.reduce((sum, r: any) =>
            sum + (r.vulnerabilities?.filter((v: any) => v.severity === 'critical').length || 0), 0);

        console.log(`[Batch Scan] Completed: ${successfulScans.length}/${repositories.length} successful, ${totalVulnerabilities} total vulnerabilities found`);

        return NextResponse.json({
            batchSummary: {
                totalScanned: repositories.length,
                successful: successfulScans.length,
                failed: repositories.length - successfulScans.length,
                totalVulnerabilities,
                criticalIssues,
                timestamp: new Date().toISOString()
            },
            results
        });

    } catch (error: any) {
        console.error('[Batch Scan API] Error:', error);
        return NextResponse.json(
            { error: 'Batch scan failed', details: error.message },
            { status: 500 }
        );
    }
}
