/**
 * Code Validator Utility
 * Heuristic-based validation for AI-generated security fixes
 */

export interface ValidationReport {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Validates generated code for potential issues like missing dependencies or syntax errors
 */
export function validateGeneratedCode(code: string, availablePackages: string[] = []): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!code || code.trim().length === 0) {
        return { valid: false, errors: ['Generated code is empty'], warnings: [] };
    }

    // 1. Basic Brace/Parenthesis Balance (Heuristic)
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
        errors.push(`Unbalanced braces: ${openBraces} open vs ${closeBraces} close`);
    }

    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
        warnings.push(`Potential unbalanced parentheses: ${openParens} open vs ${closeParens} close`);
    }

    // 2. Dependency Check
    // Extract imports using regex: import ... from 'package' OR import 'package'
    const importRegex = /import\s+.*?\s+from\s+['"](@?[a-z0-9][a-z0-9._\-/]*)['"]|import\s+['"](@?[a-z0-9][a-z0-9._\-/]*)['"]/g;
    let match;
    const imports = new Set<string>();

    while ((match = importRegex.exec(code)) !== null) {
        const pkg = match[1] || match[2];
        // Ignore relative imports and built-in type imports (heuristic)
        if (pkg && !pkg.startsWith('.') && !pkg.startsWith('/') && !['react', 'next', 'lucide-react', 'framer-motion'].includes(pkg)) {
            imports.add(pkg);
        }
    }

    const packageNamesOnly = availablePackages.map(p => {
        // Handle scoped packages
        if (p.startsWith('@')) {
            const parts = p.split('/');
            return parts.slice(0, 2).join('/');
        }
        return p.split('/')[0];
    });

    for (const pkg of imports) {
        if (!packageNamesOnly.includes(pkg)) {
            warnings.push(`Potentially missing dependency: '${pkg}' is imported but not found in project dependencies`);
        }
    }

    // 3. Security Regression Check
    const dangerousPatterns = [
        { pattern: /\beval\s*\(/, name: 'eval()' },
        { pattern: /dangerouslySetInnerHTML/, name: 'dangerouslySetInnerHTML' },
        { pattern: /\bnew\s+Function\s*\(/, name: 'new Function()' },
        { pattern: /v-html/, name: 'v-html (Vue XSS)' },
        { pattern: /\[innerHTML\]/, name: 'innerHTML (Angular XSS)' }
    ];

    for (const { pattern, name } of dangerousPatterns) {
        if (pattern.test(code)) {
            errors.push(`Security Regression: AI introduced dangerous pattern '${name}'`);
        }
    }

    // 4. Incomplete Code detection
    if (code.includes('// ...') || code.includes('/* ... */') || code.includes('// rest of code')) {
        errors.push('Incomplete code: AI provided placeholders instead of full implementation');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Formats a validation report into a human-readable string
 */
export function formatValidationReport(report: ValidationReport): string {
    let output = '';

    if (report.errors.length > 0) {
        output += 'ERRORS:\n' + report.errors.map(e => `- ${e}`).join('\n') + '\n';
    }

    if (report.warnings.length > 0) {
        output += (output ? '\n' : '') + 'WARNINGS:\n' + report.warnings.map(w => `- ${w}`).join('\n');
    }

    return output || 'Valid (No issues detected)';
}
