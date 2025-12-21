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
 * Main function to create a PR with security fixes
 */
export async function createSecurityFixPR(
    accessToken: string,
    owner: string,
    repo: string,
    fixes: FixResult[],
    baseBranch: string = 'main'
): Promise<PRCreationResult> {
    const octokit = new Octokit({ auth: accessToken });

    // Generate unique branch name
    const timestamp = Date.now();
    const branchName = `vullscanny/security-fixes-${timestamp}`;

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
        const prBody = generatePRBody(fixes);

        const { url, number } = await createPullRequest(
            octokit,
            owner,
            repo,
            branchName,
            baseBranch,
            prTitle,
            prBody
        );

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
function generatePRBody(fixes: FixResult[]): string {
    const fileList = fixes.map(fix => {
        const vulnIds = fix.vulnerabilityId.split(', ');
        return `- \`${fix.filePath}\` (${vulnIds.length} issue${vulnIds.length > 1 ? 's' : ''})`;
    }).join('\n');

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

    return `## 🛡️ Security Fixes by VullScanny

This PR contains automated security fixes for vulnerabilities detected by [VullScanny](https://vullscanny.sdad.pro).

### Files Changed
${fileList}

### Details

${details}

---

**Important:** Please review these changes carefully before merging. While these fixes address security vulnerabilities, you should verify they don't break your application's functionality.

**Generated by:** [VullScanny](https://vullscanny.sdad.pro) - Privacy-First React Security Scanner  
**Powered by:** VulkanorAI Engine

### ✅ What to do next
1. Review the changes in this PR
2. Run your tests to ensure nothing broke
3. Merge when ready
4. Update your dependencies if needed

*Your code was never stored on our servers. This PR was created using your GitHub token.*`;
}
