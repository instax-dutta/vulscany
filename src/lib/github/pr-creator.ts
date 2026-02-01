/**
 * GitHub Pull Request Creator
 * Handles branch creation, commits, and PR generation
 */

import { Octokit } from '@octokit/rest';
import type { FixResult } from '../ai/fix-generator';

export interface PRCreationResult {
    prUrl: string;
    prNumber: number;
    branch: string;
    filesChanged: number;
}

/**
 * Create a new branch from the base branch
 */
async function createBranch(
    octokit: Octokit,
    owner: string,
    repo: string,
    branchName: string,
    baseBranch: string = 'main'
): Promise<string> {
    try {
        // Get the SHA of the base branch
        const { data: ref } = await octokit.git.getRef({
            owner,
            repo,
            ref: `heads/${baseBranch}`
        });

        const baseSha = ref.object.sha;

        // Create new branch
        await octokit.git.createRef({
            owner,
            repo,
            ref: `refs/heads/${branchName}`,
            sha: baseSha
        });

        return branchName;
    } catch (error) {
        // Branch might already exist, check if it's from a previous run
        if (error instanceof Error && error.message.includes('already exists')) {
            console.log(`[PR Creator] Branch ${branchName} already exists, using it`);
            return branchName;
        }
        throw error;
    }
}

/**
 * Commit a file to a branch
 */
async function commitFile(
    octokit: Octokit,
    owner: string,
    repo: string,
    branch: string,
    filePath: string,
    content: string,
    message: string
): Promise<void> {
    try {
        // Get current file SHA (if it exists)
        let fileSha: string | undefined;
        try {
            const { data: existing } = await octokit.repos.getContent({
                owner,
                repo,
                path: filePath,
                ref: branch
            });

            if ('sha' in existing) {
                fileSha = existing.sha;
            }
        } catch (error) {
            // File doesn't exist, that's fine
        }

        // Create or update file
        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: filePath,
            message,
            content: Buffer.from(content).toString('base64'),
            branch,
            ...(fileSha && { sha: fileSha })
        });
    } catch (error) {
        console.error(`[PR Creator] Failed to commit ${filePath}:`, error);
        throw error;
    }
}

/**
 * Create a pull request
 */
async function createPullRequest(
    octokit: Octokit,
    owner: string,
    repo: string,
    branch: string,
    baseBranch: string,
    title: string,
    body: string
): Promise<{ url: string; number: number }> {
    try {
        const { data: pr } = await octokit.pulls.create({
            owner,
            repo,
            title,
            body,
            head: branch,
            base: baseBranch
        });

        return {
            url: pr.html_url,
            number: pr.number
        };
    } catch (error) {
        console.error('[PR Creator] Failed to create PR:', error);
        throw error;
    }
}

/**
 * Check if there's already an open security fix PR
 */
async function hasExistingSecurityPR(
    octokit: Octokit,
    owner: string,
    repo: string
): Promise<{ exists: boolean; prNumber?: number; prUrl?: string }> {
    try {
        const { data: prs } = await octokit.pulls.list({
            owner,
            repo,
            state: 'open',
            per_page: 100
        });

        // Look for PRs created by VullScanny or Aeglyn (backward compatibility)
        const existingPR = prs.find(pr =>
            pr.head.ref.startsWith('vullscanny/security-fixes-') ||
            pr.head.ref.startsWith('aeglyn/security-fixes-') ||
            pr.title.includes('🔒 Security Fixes')
        );

        if (existingPR) {
            return {
                exists: true,
                prNumber: existingPR.number,
                prUrl: existingPR.html_url
            };
        }

        return { exists: false };
    } catch (error) {
        console.warn('[PR Creator] Could not check for existing PRs:', error);
        return { exists: false };
    }
}

/**
 * Main function to create a PR with security fixes
 */
export async function createSecurityFixPR(
    accessToken: string,
    owner: string,
    repo: string,
    fixes: FixResult[],
    baseBranch: string = 'main',
    validationResults?: Array<{ filePath: string; validation: any }>
): Promise<PRCreationResult> {
    const octokit = new Octokit({ auth: accessToken });

    // Check for duplicate PRs first
    console.log('[PR Creator] Checking for existing security fix PRs...');
    const existing = await hasExistingSecurityPR(octokit, owner, repo);

    if (existing.exists) {
        console.log(`[PR Creator] Found existing PR #${existing.prNumber}, returning it`);
        return {
            prUrl: existing.prUrl!,
            prNumber: existing.prNumber!,
            branch: 'existing',
            filesChanged: 0
        };
    }

    // Generate unique branch name
    const timestamp = Date.now();
    const branchName = `aeglyn/security-fixes-${timestamp}`;

    try {
        // Step 1: Create branch
        console.log('[PR Creator] Creating branch:', branchName);
        await createBranch(octokit, owner, repo, branchName, baseBranch);

        // Step 2: Commit each fix
        console.log('[PR Creator] Committing fixes...');
        for (const fix of fixes) {
            await commitFile(
                octokit,
                owner,
                repo,
                branchName,
                fix.filePath,
                fix.fixedCode,
                fix.commitMessage
            );
        }

        // Step 3: Create PR
        console.log('[PR Creator] Creating pull request...');
        const prTitle = `🔒 Security Fixes: ${fixes.length} file(s) updated`;
        const prBody = generatePRBody(fixes, validationResults);

        const { url, number } = await createPullRequest(
            octokit,
            owner,
            repo,
            branchName,
            baseBranch,
            prTitle,
            prBody
        );

        // Step 4: Add label to PR for tracking
        try {
            await octokit.issues.addLabels({
                owner,
                repo,
                issue_number: number,
                labels: ['security', 'aeglyn', 'automated']
            });
        } catch (error) {
            console.warn('[PR Creator] Could not add labels:', error);
        }

        return {
            prUrl: url,
            prNumber: number,
            branch: branchName,
            filesChanged: fixes.length
        };
    } catch (error) {
        console.error('[PR Creator] Failed to create security fix PR:', error);
        throw new Error(`Failed to create PR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Generate PR description
 */
function generatePRBody(
    fixes: FixResult[],
    validationResults?: Array<{ filePath: string; validation: any }>
): string {
    const fileList = fixes.map(fix => {
        const vulnIds = fix.vulnerabilityId.split(', ');
        return `- \`${fix.filePath}\` (${vulnIds.length} issue${vulnIds.length > 1 ? 's' : ''})`;
    }).join('\n');

    // Add validation summary if available
    let validationSection = '';
    if (validationResults && validationResults.length > 0) {
        const hasErrors = validationResults.some(r => !r.validation.valid);
        const totalWarnings = validationResults.reduce(
            (sum, r) => sum + r.validation.warnings.length,
            0
        );

        validationSection = `\n### 🔍 Validation Results\n\n`;

        if (!hasErrors && totalWarnings === 0) {
            validationSection += `✅ **All checks passed!** No errors or warnings detected.\n\n`;
        } else {
            if (hasErrors) {
                validationSection += `⚠️ **Some validation issues detected** - Please review carefully\n\n`;
            } else {
                validationSection += `⚠️ **${totalWarnings} warning(s) detected** - Review recommended\n\n`;
            }

            validationResults.forEach(({ filePath, validation }) => {
                if (validation.errors.length > 0 || validation.warnings.length > 0) {
                    validationSection += `#### \`${filePath}\`\n\n`;

                    if (validation.errors.length > 0) {
                        validationSection += `**Errors:**\n`;
                        validation.errors.forEach((err: string) => {
                            validationSection += `- ❌ ${err}\n`;
                        });
                        validationSection += `\n`;
                    }

                    if (validation.warnings.length > 0) {
                        validationSection += `**Warnings:**\n`;
                        validation.warnings.forEach((warn: string) => {
                            validationSection += `- ⚠️ ${warn}\n`;
                        });
                        validationSection += `\n`;
                    }
                }
            });
        }
    }

    const details = fixes.map(fix => {
        return `### ${fix.filePath}

**Commit Message:**
\`\`\`
${fix.commitMessage}
\`\`\`

**Changes:**
\`\`\`diff
${fix.diff.split('\n').slice(0, 50).join('\n')}${fix.diff.split('\n').length > 50 ? '\n... (truncated)' : ''}
\`\`\`
`;
    }).join('\n\n---\n\n');

    return `## 🛡️ Security Fixes by Aeglyn

This PR contains automated security fixes for vulnerabilities detected by [Aeglyn](https://aeglyn.sdad.pro).

### Files Changed
${fileList}
${validationSection}
### Details

${details}

---

**Important:** Please review these changes carefully before merging. While these fixes address security vulnerabilities, you should verify they don't break your application's functionality.

**Generated by:** [Aeglyn](https://aeglyn.sdad.pro) - Privacy-First Security Scanner  
**Powered by:** VulkanorAI Engine

### ✅ What to do next
1. Review the changes in this PR
2. Run \`npm install\` if new dependencies were added
3. Run \`npm run build\` to verify the build passes
4. Run your tests to ensure nothing broke
5. Merge when ready

*Your code was never stored on our servers. This PR was created using your GitHub token.*`;
}
