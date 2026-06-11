import type { Vulnerability } from './index';
import type { WebAppProjectInfo } from '../github/stack-detector';

/**
 * Extract a code snippet from lines of code around a specific line index.
 */
export function extractSnippet(lines: string[], lineIndex: number, context: number = 2): string {
    const start = Math.max(0, lineIndex - context);
    const end = Math.min(lines.length, lineIndex + context + 1);
    return lines.slice(start, end).join('\n');
}

/**
 * Check if a line of code represents a Server-Side Rendering injection risk in Next.js.
 *
 * Detects exported `getServerSideProps` or `getStaticProps` functions that use
 * unsanitized `params` or `query` values in their context, which could lead to
 * injection attacks.
 *
 * @param line      - The trimmed line (cleanLine from scanFileContent)
 * @param lines     - Full array of all file lines (for context extraction)
 * @param lineIndex - Current line index in the loop
 * @param filePath  - Current file being scanned
 * @param stackInfo - Detected web app stack information
 * @returns A Vulnerability object if SSR injection risk is detected, or null
 */
export function checkSsrInjection(
    line: string,
    lines: string[],
    lineIndex: number,
    filePath: string,
    stackInfo: WebAppProjectInfo
): Vulnerability | null {
    const lineNum = lineIndex + 1;

    // Only applies to Next.js projects with SSR data-fetching functions
    if (stackInfo.stack === 'nextjs' && (line.includes('getServerSideProps') || line.includes('getStaticProps'))) {
        if (/export\s+(async\s+)?(function|const)\s+(getServerSideProps|getStaticProps)/.test(line)) {
            const context = lines.slice(Math.max(0, lineIndex - 1), Math.min(lines.length, lineIndex + 10)).join('\n');
            if ((context.includes('params') || context.includes('query')) && !context.includes('sanitize')) {
                return {
                    id: `${filePath}-${lineNum}-ssr-injection`,
                    type: 'ssr-injection',
                    severity: 'critical',
                    title: 'Server-Side Injection Risk',
                    description: 'Unsanitized parameters in SSR data fetching can lead to injection attacks',
                    file: filePath,
                    line: lineNum,
                    snippet: extractSnippet(lines, lineIndex),
                    recommendation: 'Always sanitize user-controlled parameters before using them in data fetching logic'
                };
            }
        }
    }

    return null;
}
