/**
 * Batch Scan API - Scan multiple repositories
 * Performs vulnerability scans on multiple repos efficiently
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { scanRepository } from '@/lib/scanner';
import { detectStack } from '@/lib/github/stack-detector';

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

    try {
        const { repositories }: BatchScanRequest = await request.json();

        if (!repositories || !Array.isArray(repositories) || repositories.length === 0) {
            return NextResponse.json({ error: 'No repositories provided' }, { status: 400 });
        }

        if (repositories.length > 10) {
            return NextResponse.json({ error: 'Maximum 10 repositories allowed per batch' }, { status: 400 });
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
