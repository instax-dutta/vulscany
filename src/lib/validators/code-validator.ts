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
        errors.push(`Unbalanced parentheses: ${openParens} open vs ${closeParens} close`);
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

    // 3. JSX-specific validation for React/Next.js
    const jsxBraces = (code.match(/\{[^}]*\}/g) || []);
    for (const brace of jsxBraces) {
        // Check for common JSX syntax errors
        if (brace.includes('}}}}') || brace.includes('{{{{')) {
            warnings.push('Potential JSX brace nesting issue detected');
        }
    }

    // 4. React Hook Rules (basic check)
    if (code.includes('useState') || code.includes('useEffect')) {
        // Hooks should be at top level of component
        const hookInConditional = /if\s*\([^)]*\)\s*\{[^}]*use[A-Z]/.test(code);
        if (hookInConditional) {
            errors.push('React hooks cannot be called inside conditions or loops');
        }
    }

    // 5. TypeScript 'any' overuse check
    const anyCount = (code.match(/:\s*any\b/g) || []).length;
    if (anyCount > 5) {
        warnings.push(`Excessive use of 'any' type (${anyCount} instances) - may hide type errors`);
    }

    // 6. Security Regression Check
    const dangerousPatterns = [
        { pattern: /\beval\s*\(/, name: 'eval()' },
        { pattern: /dangerouslySetInnerHTML(?!.*DOMPurify)/, name: 'dangerouslySetInnerHTML without sanitization' },
        { pattern: /\bnew\s+Function\s*\(/, name: 'new Function()' },
        { pattern: /v-html/, name: 'v-html (Vue XSS)' },
        { pattern: /\[innerHTML\]/, name: 'innerHTML (Angular XSS)' }
    ];

    for (const { pattern, name } of dangerousPatterns) {
        if (pattern.test(code)) {
            errors.push(`Security Regression: dangerous pattern '${name}' detected`);
        }
    }

    // 7. Incomplete Code detection
    const incompletePatterns = [
        '// ...',
        '/* ... */',
        '// rest of code',
        '/* rest of code */',
        '// TODO',
        '// FIXME',
        '...',  // Only if it's a comment or placeholder, not spread operator
    ];

    for (const pattern of incompletePatterns) {
        if (code.includes(pattern)) {
            // Avoid false positives with spread operator
            if (pattern === '...' && /\[\.\.\./.test(code)) {
                continue; // This is a spread operator, not a placeholder
            }
            errors.push(`Incomplete code: Found placeholder '${pattern}'`);
            break;
        }
    }

    // 8. Function return validation (basic heuristic)
    const functionDeclarations = code.match(/function\s+\w+\s*\([^)]*\)\s*:\s*\w+/g) || [];
    for (const func of functionDeclarations) {
        // If function has a return type, it should have a return statement
        const funcName = func.match(/function\s+(\w+)/)?.[1];
        if (funcName && !code.includes(`return`) && !func.includes(': void')) {
            warnings.push(`Function '${funcName}' declares a return type but may be missing return statement`);
        }
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
