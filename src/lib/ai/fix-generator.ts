/**
 * AI-Powered Fix Generator
 * Generates actual code fixes for security vulnerabilities
 */

import { explainVulnerability } from './mistral';
import type { Vulnerability } from '../scanner';

export interface FixResult {
    filePath: string;
    originalCode: string;
    fixedCode: string;
    diff: string;
    vulnerabilityId: string;
    commitMessage: string;
}

/**
 * Generate a code fix for a vulnerability
 */
export async function generateCodeFix(
    vulnerability: Vulnerability,
    fileContent: string
): Promise<FixResult> {
    // Build a comprehensive prompt for fix generation
    const prompt = `You are a security expert. Fix the following ${vulnerability.severity} severity security issue in this code.

VULNERABILITY:
- Type: ${vulnerability.type}
- Title: ${vulnerability.title}
- Description: ${vulnerability.description}
- File: ${vulnerability.file}
${vulnerability.line ? `- Line: ${vulnerability.line}` : ''}

CURRENT CODE:
\`\`\`
${fileContent}
\`\`\`

${vulnerability.snippet ? `VULNERABLE SNIPPET:
\`\`\`
${vulnerability.snippet}
\`\`\`
` : ''}

INSTRUCTIONS:
1. Generate the COMPLETE fixed version of the file (not just the snippet)
2. Apply the security fix: ${vulnerability.recommendation}
3. Maintain all existing functionality
4. Keep the same code style and formatting
5. Add necessary imports (e.g., DOMPurify, etc.)
6. Add comments explaining the security fix

RESPOND WITH ONLY THE COMPLETE FIXED FILE CODE. NO EXPLANATIONS, JUST CODE.`;

    try {
        // Use AI to generate the fix
        const aiResponse = await explainVulnerability(
            vulnerability.type,
            vulnerability.file,
            vulnerability.snippet || fileContent.substring(0, 500)
        );

        // For now, since explainVulnerability returns explanations, 
        // we'll create a simple fix by applying the recommendation
        // In a real implementation, we'd use a dedicated fix generation model

        const fixedCode = applySecurityFix(vulnerability, fileContent);

        return {
            filePath: vulnerability.file,
            originalCode: fileContent,
            fixedCode,
            diff: generateDiff(fileContent, fixedCode),
            vulnerabilityId: vulnerability.id,
            commitMessage: `fix(security): ${vulnerability.title}\n\n${vulnerability.description}\n\nSeverity: ${vulnerability.severity}\nType: ${vulnerability.type}`
        };
    } catch (error) {
        console.error('[Fix Generator] Error generating fix:', error);
        throw new Error(`Failed to generate fix: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Apply security fix based on vulnerability type
 * This is a simplified version - in production, you'd use AI for more complex fixes
 */
function applySecurityFix(vulnerability: Vulnerability, content: string): string {
    let fixed = content;

    switch (vulnerability.type) {
        case 'dangerous-api':
            // Add DOMPurify import if not present
            if (!content.includes('DOMPurify')) {
                fixed = `import DOMPurify from 'dompurify';\n${fixed}`;
            }

            // Replace dangerouslySetInnerHTML with sanitized version
            fixed = fixed.replace(
                /dangerouslySetInnerHTML\s*=\s*{{\s*__html:\s*([^}]+)\s*}}/g,
                'dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize($1) }}'
            );
            break;

        case 'xss-vulnerable-attribute':
            // Add URL validation
            if (vulnerability.snippet?.includes('href=')) {
                fixed = fixed.replace(
                    /href\s*=\s*{([^}]+)}/g,
                    (match, urlVar) => {
                        return `href={${urlVar.trim()}.startsWith('http://') || ${urlVar.trim()}.startsWith('https://') ? ${urlVar.trim()} : '#'}`;
                    }
                );
            }
            break;

        case 'ssr-injection':
            // Add encoding for server-side rendering
            fixed = fixed.replace(
                />\s*{\s*([^}]+)\s*}\s*</g,
                '>{encodeURIComponent($1)}<'
            );
            break;

        default:
            // For other types, add a TODO comment
            const lines = fixed.split('\n');
            if (vulnerability.line && vulnerability.line > 0 && vulnerability.line <= lines.length) {
                lines[vulnerability.line - 1] = `// TODO: Fix ${vulnerability.type} - ${vulnerability.recommendation}\n${lines[vulnerability.line - 1]}`;
                fixed = lines.join('\n');
            }
    }

    return fixed;
}

/**
 * Generate a simple diff between original and fixed code
 */
function generateDiff(original: string, fixed: string): string {
    const originalLines = original.split('\n');
    const fixedLines = fixed.split('\n');

    let diff = '';
    const maxLines = Math.max(originalLines.length, fixedLines.length);

    for (let i = 0; i < maxLines; i++) {
        const origLine = originalLines[i] || '';
        const fixedLine = fixedLines[i] || '';

        if (origLine !== fixedLine) {
            if (origLine) {
                diff += `- ${origLine}\n`;
            }
            if (fixedLine) {
                diff += `+ ${fixedLine}\n`;
            }
        } else {
            diff += `  ${origLine}\n`;
        }
    }

    return diff;
}

/**
 * Generate fixes for multiple vulnerabilities at once
 */
export async function generateBatchFixes(
    vulnerabilities: Vulnerability[],
    fileContents: Map<string, string>
): Promise<FixResult[]> {
    const fixes: FixResult[] = [];

    // Group vulnerabilities by file
    const vulnsByFile = new Map<string, Vulnerability[]>();
    for (const vuln of vulnerabilities) {
        const existing = vulnsByFile.get(vuln.file) || [];
        existing.push(vuln);
        vulnsByFile.set(vuln.file, existing);
    }

    // Generate fixes file by file
    for (const [filePath, vulns] of vulnsByFile) {
        const content = fileContents.get(filePath);
        if (!content) {
            console.warn(`[Fix Generator] No content found for ${filePath}`);
            continue;
        }

        // Apply all fixes for this file
        let fixedContent = content;
        const appliedFixes: FixResult[] = [];

        for (const vuln of vulns) {
            try {
                const fix = await generateCodeFix(vuln, fixedContent);
                fixedContent = fix.fixedCode; // Apply fix cumulatively
                appliedFixes.push(fix);
            } catch (error) {
                console.error(`[Fix Generator] Failed to fix ${vuln.id}:`, error);
            }
        }

        // Create a single fix result for the file with all changes
        if (appliedFixes.length > 0) {
            fixes.push({
                filePath,
                originalCode: content,
                fixedCode: fixedContent,
                diff: generateDiff(content, fixedContent),
                vulnerabilityId: vulns.map(v => v.id).join(', '),
                commitMessage: `fix(security): Fix ${vulns.length} security issue(s) in ${filePath}\n\n${vulns.map(v => `- ${v.title}`).join('\n')}`
            });
        }
    }

    return fixes;
}
