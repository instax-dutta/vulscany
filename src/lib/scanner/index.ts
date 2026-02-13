import { getFileContent, getDirectoryContents } from '../github/client';
import type { WebAppProjectInfo } from '../github/stack-detector';
import { detectHighRiskDependencies } from '../github/stack-detector';

export interface Vulnerability {
    id: string;
    type: 'version' | 'dangerous-api' | 'ssr-injection' | 'markdown-xss' | 'dependency' | 'xss-vulnerable-attribute' | 'code-execution-pattern' | 'obfuscation' | 'secret-exposure';
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
    stackInfo: WebAppProjectInfo;
    vulnerabilities: Vulnerability[];
    status: 'safe' | 'needs-attention' | 'high-risk';
    summary: string;
    scanDuration: number;
    threatIntelligence?: {
        riskScore: number;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        cveCount: number;
        advisoryCount: number;
        scanFindingsCount?: number;
        criticalThreats: number;
        recommendations: string[];
        displayInUI?: boolean;
    };
}

/**
 * Main scanner function
 */
export async function scanRepository(
    accessToken: string,
    owner: string,
    repo: string,
    stackInfo: WebAppProjectInfo
): Promise<ScanResult> {
    const startTime = Date.now();
    const vulnerabilities: Vulnerability[] = [];

    // 1. Check dependencies
    const depRisks = detectHighRiskDependencies(stackInfo.dependencies);
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

    // 2. Scan source files for dangerous patterns
    const sourceVulns = await scanSourceFiles(accessToken, owner, repo, stackInfo);
    vulnerabilities.push(...sourceVulns);

    // Determine status
    const status = determineStatus(vulnerabilities);
    const summary = generateSummary(vulnerabilities);
    const scanDuration = Date.now() - startTime;

    return {
        repoName: repo,
        owner,
        scanTimestamp: new Date().toISOString(),
        stackInfo,
        vulnerabilities,
        status,
        summary,
        scanDuration
    };
}

/**
 * Scan source files for security patterns (Recursive)
 */
async function scanSourceFiles(
    accessToken: string,
    owner: string,
    repo: string,
    stackInfo: WebAppProjectInfo
): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];
    const MAX_DEPTH = 6;
    const MAX_FILES = 150; // Increased for deeper scanning
    let scannedFileCount = 0;

    // Start scanning from the detected project root
    const startPath = stackInfo.projectRoot || '';
    const queue: { path: string, depth: number }[] = [{ path: startPath, depth: 0 }];
    const processedPaths = new Set<string>();

    while (queue.length > 0 && scannedFileCount < MAX_FILES) {
        const { path, depth } = queue.shift()!;

        if (depth > MAX_DEPTH) continue;
        if (processedPaths.has(path)) continue;
        processedPaths.add(path);

        const items = await getDirectoryContents(accessToken, owner, repo, path);

        for (const item of items) {
            if (item.type === 'dir') {
                // Safeguard: If we're in a specific project root, don't wander into unrelated root folders
                if (stackInfo.projectRoot && path === '' && item.path !== stackInfo.projectRoot) {
                    continue;
                }

                if (['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage', 'public', 'vendor', 'temp', 'tmp', '.agent'].includes(item.name)) continue;
                if (item.name.startsWith('.')) continue;
                queue.push({ path: item.path, depth: depth + 1 });
            }
            else if (item.type === 'file') {
                if (item.size > 800 * 1024) continue;

                // Expanded relevant file extensions
                const isRelevantFile = item.name.match(/\.(jsx?|tsx?|vue|svelte|html|php|py|rb|go|rs|sh|ps1)$/);

                const isNoiseFile = item.name.match(/\.(test|spec|config|setup|stories|d|min|map)\.[tj]sx?$/) ||
                    item.name.match(/^(jest|next|postcss|tailwind|vite|webpack|babel|eslint|prettier)\.config\.[tj]s$/);

                if (isRelevantFile && !isNoiseFile) {
                    scannedFileCount++;
                    const content = await getFileContent(accessToken, owner, repo, item.path);
                    if (content) {
                        const fileVulns = scanFileContent(content.content, item.path, stackInfo);
                        vulnerabilities.push(...fileVulns);
                    }
                }
            }
        }
    }

    return vulnerabilities;
}

/**
 * Scan individual file for vulnerabilities with multi-stack support
 */
function scanFileContent(
    content: string,
    filePath: string,
    stackInfo: WebAppProjectInfo
): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = [];
    const lines = content.split('\n');
    let inBlockComment = false;

    // Advanced Zero-day & Multi-Stack Patterns
    const patterns = [
        // 1. React dangerous API
        {
            stack: 'react',
            pattern: /dangerouslySetInnerHTML\s*[:=]/,
            type: 'dangerous-api',
            severity: 'high',
            title: 'Unsafe HTML Rendering (React)',
            recommendation: 'Use DOMPurify.sanitize() before rendering'
        },
        // 2. Vue dangerous API
        {
            stack: 'vue',
            pattern: /v-html\s*[:=]/,
            type: 'dangerous-api',
            severity: 'high',
            title: 'Unsafe HTML Rendering (Vue)',
            recommendation: 'Always sanitize data before using v-html'
        },
        // 3. Angular dangerous API
        {
            stack: 'angular',
            pattern: /\[innerHTML\]\s*[:=]|bypassSecurityTrustHtml/,
            type: 'dangerous-api',
            severity: 'high',
            title: 'Unsafe HTML Rendering (Angular)',
            recommendation: 'Avoid bypassSecurityTrustHtml and use safer alternatives'
        },
        // 4. Svelte dangerous API
        {
            stack: 'svelte',
            pattern: /\{@html\s+/,
            type: 'dangerous-api',
            severity: 'high',
            title: 'Unsafe HTML Rendering (Svelte)',
            recommendation: 'Ensure content is sanitized before using {@html}'
        },
        // 5. Generic Code Execution
        {
            pattern: /\beval\s*\(|\bnew\s+Function\s*\(|\bsetTimeout\s*\(\s*['"`]|\bsetInterval\s*\(\s*['"`]/,
            type: 'code-execution-pattern',
            severity: 'critical',
            title: 'Dangerous Dynamic Execution',
            recommendation: 'Never use eval() or string-based timers with user input'
        },
        // 6. Obfuscation detection
        {
            pattern: /atob\s*\(\s*['"`][A-Za-z0-9+/=]{20,}/,
            type: 'obfuscation',
            severity: 'medium',
            title: 'Suspicious Base64 Content',
            recommendation: 'Verify the source of obfuscated strings as they may hide malicious logic'
        },
        // 7. Secret exposure
        {
            pattern: /(API_KEY|SECRET|PASSWORD|TOKEN|AWS_ACCESS_KEY|PRIVATE_KEY)\s*[:=]\s*['"`][A-Za-z0-9_\-]{16,}/i,
            type: 'secret-exposure',
            severity: 'critical',
            title: 'Potential Secret Exposure',
            recommendation: 'Use environment variables for secrets, never hardcode them'
        }
    ];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        const lineNum = i + 1;

        if (!line || line.includes('@aeglyn-ignore')) continue;

        // Skip comments
        if (line.includes('/*')) inBlockComment = true;
        if (inBlockComment) {
            if (line.includes('*/')) inBlockComment = false;
            continue;
        }
        if (line.startsWith('//') || line.startsWith('#') || line.startsWith('--')) continue;

        const cleanLine = line.split('//')[0].split('/*')[0].trim();

        for (const p of patterns) {
            if (p.stack && stackInfo.stack !== p.stack && stackInfo.stack !== 'other') {
                continue;
            }

            if (p.pattern.test(cleanLine)) {
                // Skip if this is in a string literal (educational/documentation)
                const isInStringLiteral = isLineInStringContext(line, p.pattern);
                if (isInStringLiteral) continue;

                // Auto-FP reduction: Check for sanitization
                const isAlreadySanitized = cleanLine.includes('sanitize') ||
                    cleanLine.includes('DOMPurify') ||
                    cleanLine.includes('escape');

                if (isAlreadySanitized && p.type === 'dangerous-api') continue;

                vulnerabilities.push({
                    id: `${filePath}-${lineNum}-${p.type}`,
                    type: p.type as any,
                    severity: p.severity as any,
                    title: p.title,
                    description: `Security pattern match: ${p.title} found in ${filePath}`,
                    file: filePath,
                    line: lineNum,
                    snippet: extractSnippet(lines, i),
                    recommendation: p.recommendation
                });
            }
        }

        // Special check for SSR Injection in Next.js
        if (stackInfo.stack === 'nextjs' && (cleanLine.includes('getServerSideProps') || cleanLine.includes('getStaticProps'))) {
            if (/export\s+(async\s+)?(function|const)\s+(getServerSideProps|getStaticProps)/.test(cleanLine)) {
                const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 10)).join('\n');
                if ((context.includes('params') || context.includes('query')) && !context.includes('sanitize')) {
                    vulnerabilities.push({
                        id: `${filePath}-${lineNum}-ssr-injection`,
                        type: 'ssr-injection',
                        severity: 'critical',
                        title: 'Server-Side Injection Risk',
                        description: 'Unsanitized parameters in SSR data fetching can lead to injection attacks',
                        file: filePath,
                        line: lineNum,
                        snippet: extractSnippet(lines, i),
                        recommendation: 'Always sanitize user-controlled parameters before using them in data fetching logic'
                    });
                }
            }
        }
    }

    return vulnerabilities;
}

/**
 * Check if a pattern match is within a string literal context
 * This prevents false positives from educational content and documentation
 */
function isLineInStringContext(line: string, pattern: RegExp): boolean {
    const match = pattern.exec(line);
    if (!match) return false;

    const matchIndex = match.index;
    let inString = false;
    let stringChar = '';
    let escaped = false;

    for (let i = 0; i < matchIndex; i++) {
        const char = line[i];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (char === '\\') {
            escaped = true;
            continue;
        }

        if ((char === '"' || char === "'" || char === '`') && !inString) {
            inString = true;
            stringChar = char;
        } else if (char === stringChar && inString) {
            inString = false;
            stringChar = '';
        }
    }

    return inString;
}

function extractSnippet(lines: string[], lineIndex: number, context: number = 2): string {
    const start = Math.max(0, lineIndex - context);
    const end = Math.min(lines.length, lineIndex + context + 1);
    return lines.slice(start, end).join('\n');
}

function determineStatus(vulnerabilities: Vulnerability[]): 'safe' | 'needs-attention' | 'high-risk' {
    if (vulnerabilities.length === 0) return 'safe';
    const hasCritical = vulnerabilities.some(v => v.severity === 'critical');
    const hasHigh = vulnerabilities.some(v => v.severity === 'high');
    if (hasCritical) return 'high-risk';
    if (hasHigh || vulnerabilities.length > 3) return 'high-risk';
    return 'needs-attention';
}

function generateSummary(vulnerabilities: Vulnerability[]): string {
    if (vulnerabilities.length === 0) return 'Great! No security issues detected. Consider regular deep scans.';
    const critical = vulnerabilities.filter(v => v.severity === 'critical').length;
    const high = vulnerabilities.filter(v => v.severity === 'high').length;
    const count = vulnerabilities.length;
    return `Analysis complete: Found ${count} potential risks (${critical} critical, ${high} high). Security hardening recommended.`;
}
