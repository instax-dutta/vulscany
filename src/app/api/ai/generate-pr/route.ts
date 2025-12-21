/**
 * API Route: Generate PR with Security Fixes
 * Creates a pull request with automated security fixes
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateBatchFixes } from '@/lib/ai/fix-generator';
import { createSecurityFixPR } from '@/lib/github/pr-creator';
import { getFileContent } from '@/lib/github/client';
import type { Vulnerability } from '@/lib/scanner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface GeneratePRRequest {
    owner: string;
    repo: string;
    vulnerabilities: Vulnerability[];
    baseBranch?: string;
    mode?: 'preview' | 'create';
}

export async function POST(request: NextRequest) {
    try {
        // Get GitHub token from cookies
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('github_token')?.value;

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in with GitHub.' },
                { status: 401 }
            );
        }

        // Parse request body
        const body: GeneratePRRequest = await request.json();
        const { owner, repo, vulnerabilities, baseBranch = 'main', mode = 'preview' } = body;

        // Validate input
        if (!owner || !repo || !vulnerabilities || vulnerabilities.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields: owner, repo, vulnerabilities' },
                { status: 400 }
            );
        }

        console.log(`[Generate PR] Processing ${vulnerabilities.length} vulnerabilities for ${owner}/${repo}`);

        // Step 1: Fetch file contents for all vulnerable files
        const fileContents = new Map<string, string>();
        const uniqueFiles = [...new Set(vulnerabilities.map(v => v.file))];

        for (const filePath of uniqueFiles) {
            try {
                const fileData = await getFileContent(accessToken, owner, repo, filePath);

                if (!fileData) {
                    return NextResponse.json(
                        { error: `File not found: ${filePath}` },
                        { status: 404 }
                    );
                }

                fileContents.set(filePath, fileData.content);
            } catch (error) {
                console.error(`[Generate PR] Failed to fetch ${filePath}:`, error);
                return NextResponse.json(
                    { error: `Failed to fetch file: ${filePath}` },
                    { status: 500 }
                );
            }
        }

        // Step 2: Generate fixes
        console.log('[Generate PR] Generating fixes...');
        const fixes = await generateBatchFixes(vulnerabilities, fileContents);

        if (fixes.length === 0) {
            return NextResponse.json(
                { error: 'No fixes could be generated' },
                { status: 500 }
            );
        }

        // Step 3: Preview mode - just return the fixes
        if (mode === 'preview') {
            return NextResponse.json({
                success: true,
                mode: 'preview',
                fixes: fixes.map(fix => ({
                    filePath: fix.filePath,
                    diff: fix.diff,
                    vulnerabilityId: fix.vulnerabilityId,
                    commitMessage: fix.commitMessage
                })),
                totalFiles: fixes.length
            });
        }

        // Step 4: Create mode - create the PR
        console.log('[Generate PR] Creating pull request...');
        const prResult = await createSecurityFixPR(
            accessToken,
            owner,
            repo,
            fixes,
            baseBranch
        );

        return NextResponse.json({
            success: true,
            mode: 'create',
            prUrl: prResult.prUrl,
            prNumber: prResult.prNumber,
            branch: prResult.branch,
            filesChanged: prResult.filesChanged,
            fixes: fixes.map(fix => ({
                filePath: fix.filePath,
                vulnerabilityId: fix.vulnerabilityId
            }))
        });

    } catch (error) {
        console.error('[Generate PR] Error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        return NextResponse.json(
            {
                error: 'Failed to generate PR',
                details: errorMessage
            },
            { status: 500 }
        );
    }
}
