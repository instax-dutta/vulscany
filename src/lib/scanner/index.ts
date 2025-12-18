/**
 * Vulnerability Scanner
 * Lightweight static analysis for React security issues
 */

import { getFileContent, getDirectoryContents } from '../github/client';
import type { ReactProjectInfo } from '../github/react-detector';
import { isReactVersionVulnerable, detectHighRiskDependencies } from '../github/react-detector';

export interface Vulnerability {
    id: string;
    type: 'version' | 'dangerous-api' | 'ssr-injection' | 'markdown-xss' | 'dependency';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    file: string;
    line?: number;
    snippet?: string;
    recommendation: string;
}

export interface ScanResult {
    repoName: string;
    owner: string;
    scanTimestamp: string;
    reactInfo: ReactProjectInfo;
    vulnerabilities: Vulnerability[];
    status: 'safe' | 'needs-attention' | 'high-risk';
    summary: string;
    threatIntelligence?: {
        riskScore: number;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        cveCount: number;
        advisoryCount: number;
        criticalThreats: number;
        recommendations: string[];
    };
}

/**
 * Main scanner function
 */
export async function scanRepository(
    accessToken: string,
    owner: string,
    repo: string,
    reactInfo: ReactProjectInfo
): Promise<ScanResult> {
    const vulnerabilities: Vulnerability[] = [];

    // 1. Check React version
    if (reactInfo.reactVersion) {
        const versionCheck = isReactVersionVulnerable(reactInfo.reactVersion);
        if (versionCheck.isVulnerable) {
            vulnerabilities.push({
                id: `${repo}-version`,
                type: 'version',
                severity: 'medium',
                title: 'Outdated React Version',
                description: versionCheck.reason || 'Your React version may have security vulnerabilities',
                file: 'package.json',
                recommendation: `Update React to version ${versionCheck.recommendedVersion} or later`
            });
        }
    }

    // 2. Check dependencies
    const depRisks = detectHighRiskDependencies(reactInfo.dependencies);
    for (const risk of depRisks) {
        vulnerabilities.push({
            id: `${repo}-dep-${risk.package}`,
            type: 'dependency',
            severity: 'medium',
            title: `Potentially Risky Dependency: ${risk.package}`,
            description: risk.risk,
            file: 'package.json',
            recommendation: 'Ensure proper input sanitization when using this package'
        });
    }

    // 3. Scan source files for dangerous patterns
    const sourceVulns = await scanSourceFiles(accessToken, owner, repo, reactInfo);
    vulnerabilities.push(...sourceVulns);

    // Determine status
    const status = determineStatus(vulnerabilities);
    const summary = generateSummary(vulnerabilities);

    return {
        repoName: repo,
        owner,
        scanTimestamp: new Date().toISOString(),
        reactInfo,
        vulnerabilities,
        status,
        summary
    };
}

/**
 * Scan source files for security patterns
 */
/**
 * Scan source files for security patterns (Recursive)
 */
async function scanSourceFiles(
    accessToken: string,
    owner: string,
    repo: string,
    reactInfo: ReactProjectInfo
): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];
    const MAX_DEPTH = 5;
    const MAX_FILES = 100; // Prevent scanning massive repos entirely
    let scannedFileCount = 0;

    // Queue for BFS traversal: { path: string, depth: number }
    const queue: { path: string, depth: number }[] = [{ path: '', depth: 0 }];
    const processedPaths = new Set<string>();

    while (queue.length > 0 && scannedFileCount < MAX_FILES) {
        const { path, depth } = queue.shift()!;

        if (depth > MAX_DEPTH) continue;
        if (processedPaths.has(path)) continue;
        processedPaths.add(path);

        const items = await getDirectoryContents(accessToken, owner, repo, path);

        for (const item of items) {
            // SKIP ignored directories
            if (item.type === 'dir') {
                if (['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage'].includes(item.name)) continue;
                if (item.name.startsWith('.')) continue; // skip hidden folders
                queue.push({ path: item.path, depth: depth + 1 });
            }
            // SCAN only relevant files
            else if (item.type === 'file') {
                // Skip large files (>500KB) to avoid API timeouts and irrelevant scans
                if (item.size > 500 * 1024) continue;

                if (item.name.match(/\.(jsx?|tsx?)$/)) {
                    scannedFileCount++;
                    const content = await getFileContent(accessToken, owner, repo, item.path);
                    if (content) {
                        const fileVulns = scanFileContent(content.content, item.path, reactInfo);
                        vulnerabilities.push(...fileVulns);
                    }
                }
            }
        }
    }

    return vulnerabilities;
}

/**
 * Scan individual file for vulnerabilities
 */
function scanFileContent(
    content: string,
    filePath: string,
    reactInfo: ReactProjectInfo
): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = [];
    const lines = content.split('\n');
    let inBlockComment = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        const lineNum = i + 1;

        // Skip empty lines
        if (!line) continue;

        // Handle block comments
        if (line.includes('/*')) inBlockComment = true;

        let lineWithoutComments = line;
        if (inBlockComment) {
            if (line.includes('*/')) {
                inBlockComment = false;
                lineWithoutComments = line.split('*/').pop() || '';
            } else {
                continue; // Inside block comment
            }
        }

        // Handle single line comments
        lineWithoutComments = lineWithoutComments.split('//')[0].split('#')[0].trim();
        if (!lineWithoutComments) continue;

        // 1. Check for dangerouslySetInnerHTML
        if (lineWithoutComments.includes('dangerouslySetInnerHTML')) {
            // Check if it's likely a prop or usage, not just a string
            const isUsage = /dangerouslySetInnerHTML\s*[:=]/.test(lineWithoutComments);
            if (isUsage) {
                const snippet = extractSnippet(lines, i);
                vulnerabilities.push({
                    id: `${filePath}-${lineNum}-dangerous-html`,
                    type: 'dangerous-api',
                    severity: 'high',
                    title: 'Unsafe HTML Rendering',
                    description: 'Using dangerouslySetInnerHTML can expose your app to XSS attacks if the content is not properly sanitized',
                    file: filePath,
                    line: lineNum,
                    snippet,
                    recommendation: 'Use DOMPurify to sanitize HTML content, or avoid dangerouslySetInnerHTML entirely'
                });
            }
        }

        // 2. Check for potential SSR injection (Next.js specific)
        if (reactInfo.hasNext && (lineWithoutComments.includes('getServerSideProps') || lineWithoutComments.includes('getStaticProps'))) {
            // Check if there's unsanitized user input in the surrounding scope
            const contextLines = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 30));
            const hasUserInput = contextLines.some(l => {
                const clean = l.split('//')[0];
                return clean.includes('params') || clean.includes('query') || clean.includes('req.');
            });
            const hasSanitization = contextLines.some(l => {
                const clean = l.split('//')[0];
                return clean.includes('sanitize') || clean.includes('escape') || clean.includes('DOMPurify') || clean.includes('encodeURI');
            });

            if (hasUserInput && !hasSanitization) {
                // Verify it's actually an exported function or constant, not a mention
                const isDefinition = /export\s+(async\s+)?(function|const)\s+(getServerSideProps|getStaticProps)/.test(lineWithoutComments) ||
                    /getServerSideProps|getStaticProps/.test(lineWithoutComments);

                if (isDefinition) {
                    vulnerabilities.push({
                        id: `${filePath}-${lineNum}-ssr-injection`,
                        type: 'ssr-injection',
                        severity: 'critical',
                        title: 'Potential SSR Injection Risk',
                        description: 'Server-side rendering with unsanitized user input can lead to injection vulnerabilities',
                        file: filePath,
                        line: lineNum,
                        snippet: extractSnippet(lines, i),
                        recommendation: 'Always sanitize user input before passing to props. Validate and escape all query parameters and URL params'
                    });
                }
            }
        }

        // 3. Check for markdown rendering without sanitization
        if (lineWithoutComments.match(/react-markdown|marked|markdown-it/)) {
            // Only flag if it looks like an import or initialization and sanitization is not mentioned in the whole file
            const hasSanitizeInFile = content.includes('sanitize') || content.includes('DOMPurify') || content.includes('rehype-sanitize');
            if (!hasSanitizeInFile) {
                vulnerabilities.push({
                    id: `${filePath}-${lineNum}-markdown-xss`,
                    type: 'markdown-xss',
                    severity: 'high',
                    title: 'Unsafe Markdown Rendering',
                    description: 'Rendering markdown without sanitization can lead to XSS vulnerabilities',
                    file: filePath,
                    line: lineNum,
                    snippet: extractSnippet(lines, i),
                    recommendation: 'Use rehype-sanitize or similar plugins to sanitize markdown content'
                });
            }
        }

        // 4. Check for eval or Function constructor (red flag)
        if (lineWithoutComments.match(/\beval\(|new Function\(/)) {
            // Ensure matches are actual calls, not just strings or words in comments (already handled by split('//'))
            vulnerabilities.push({
                id: `${filePath}-${lineNum}-eval`,
                type: 'dangerous-api',
                severity: 'critical',
                title: 'Dangerous Code Execution',
                description: 'Using eval() or Function() constructor can execute arbitrary code and is extremely dangerous',
                file: filePath,
                line: lineNum,
                snippet: extractSnippet(lines, i),
                recommendation: 'Remove eval() and find a safer alternative. Never execute user-provided code'
            });
        }
    }

    return vulnerabilities;
}

/**
 * Extract code snippet around a line
 */
function extractSnippet(lines: string[], lineIndex: number, context: number = 2): string {
    const start = Math.max(0, lineIndex - context);
    const end = Math.min(lines.length, lineIndex + context + 1);
    return lines.slice(start, end).join('\n');
}

/**
 * Determine overall status
 */
function determineStatus(vulnerabilities: Vulnerability[]): 'safe' | 'needs-attention' | 'high-risk' {
    if (vulnerabilities.length === 0) return 'safe';

    const hasCritical = vulnerabilities.some(v => v.severity === 'critical');
    const hasHigh = vulnerabilities.some(v => v.severity === 'high');

    if (hasCritical) return 'high-risk';
    if (hasHigh || vulnerabilities.length > 3) return 'high-risk';
    return 'needs-attention';
}

/**
 * Generate summary
 */
function generateSummary(vulnerabilities: Vulnerability[]): string {
    if (vulnerabilities.length === 0) {
        return 'Great! No obvious security issues detected. Keep your dependencies updated!';
    }

    const critical = vulnerabilities.filter(v => v.severity === 'critical').length;
    const high = vulnerabilities.filter(v => v.severity === 'high').length;
    const medium = vulnerabilities.filter(v => v.severity === 'medium').length;

    const parts: string[] = [];
    if (critical > 0) parts.push(`${critical} critical issue${critical > 1 ? 's' : ''}`);
    if (high > 0) parts.push(`${high} high-risk issue${high > 1 ? 's' : ''}`);
    if (medium > 0) parts.push(`${medium} medium-risk issue${medium > 1 ? 's' : ''}`);

    return `Found ${parts.join(', ')}. Don't worry - we'll help you fix them!`;
}
