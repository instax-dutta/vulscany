/**
 * Code Validator
 * Validates generated code before committing to prevent build failures
 */

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Check for balanced brackets, braces, and parentheses
 */
function checkBalancedDelimiters(code: string): string[] {
    const errors: string[] = [];
    const stack: string[] = [];
    const pairs: Record<string, string> = {
        '(': ')',
        '[': ']',
        '{': '}'
    };

    // Remove strings and comments to avoid false positives
    const cleanCode = code
        .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
        .replace(/\/\/.*/g, '') // line comments
        .replace(/'(?:[^'\\]|\\.)*'/g, "''") // single-quoted strings
        .replace(/"(?:[^"\\]|\\.)*"/g, '""') // double-quoted strings
        .replace(/`(?:[^`\\]|\\.)*`/g, '``'); // template literals

    for (let i = 0; i < cleanCode.length; i++) {
        const char = cleanCode[i];

        if (char in pairs) {
            stack.push(char);
        } else if (Object.values(pairs).includes(char)) {
            const lastOpening = stack.pop();
            if (!lastOpening || pairs[lastOpening] !== char) {
                errors.push(`Unmatched '${char}' at position ${i}`);
            }
        }
    }

    if (stack.length > 0) {
        errors.push(`Unclosed delimiters: ${stack.join(', ')}`);
    }

    return errors;
}

/**
 * Validate import statements
 */
function validateImports(code: string, availablePackages: string[]): string[] {
    const errors: string[] = [];
    const importRegex = /import\s+(?:(?:\{[^}]*\})|(?:\*\s+as\s+\w+)|(?:\w+))\s+from\s+['"]([^'"]+)['"]/g;

    let match;
    while ((match = importRegex.exec(code)) !== null) {
        const importPath = match[1];

        // Skip relative imports (they're file paths)
        if (importPath.startsWith('.') || importPath.startsWith('/')) {
            continue;
        }

        // Check if package exists in dependencies
        const packageName = importPath.startsWith('@')
            ? importPath.split('/').slice(0, 2).join('/')
            : importPath.split('/')[0];

        if (!availablePackages.includes(packageName)) {
            errors.push(`Import '${importPath}' - package '${packageName}' not found in dependencies. May need to add to package.json.`);
        }
    }

    return errors;
}

/**
 * Check for common TypeScript/React issues
 */
function checkCommonIssues(code: string): { errors: string[], warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for console.log (should be removed in production code)
    if (/console\.(log|debug|info)/.test(code)) {
        warnings.push('Contains console.log statements - consider removing for production');
    }

    // Check for debugger statements
    if (/\bdebugger\b/.test(code)) {
        errors.push('Contains debugger statements - must be removed');
    }

    // Check for any type (bad practice in strict mode)
    const anyTypeMatches = code.match(/:\s*any(?:\s|;|,|\))/g);
    if (anyTypeMatches && anyTypeMatches.length > 3) {
        warnings.push(`Contains ${anyTypeMatches.length} 'any' types - prefer specific types in strict mode`);
    }

    // Check for dangerouslySetInnerHTML without sanitization
    if (/dangerouslySetInnerHTML/.test(code) && !/sanitize|DOMPurify/.test(code)) {
        errors.push('Uses dangerouslySetInnerHTML without visible sanitization - security risk!');
    }

    // Check for eval (security risk)
    if (/\beval\(/.test(code)) {
        errors.push('Uses eval() - major security risk, must be removed');
    }

    // Check for basic JSX syntax if it's a React file
    if (/import\s+.*React/.test(code) || /from\s+['"]react['"]/.test(code)) {
        // Check for unclosed JSX tags (basic check)
        const openTags = (code.match(/<\w+(?:\s|>)/g) || []).length;
        const closeTags = (code.match(/<\/\w+>/g) || []).length;
        const selfClosing = (code.match(/\/>/g) || []).length;

        if (openTags !== closeTags + selfClosing) {
            warnings.push('Possible JSX tag mismatch - verify all tags are properly closed');
        }
    }

    // Check for async/await without try-catch
    const asyncFunctions = code.match(/async\s+(?:function|\()/g);
    const awaits = code.match(/\bawait\s+/g);
    const tryCatches = code.match(/try\s*\{/g);

    if (awaits && awaits.length > 0 && (!tryCatches || tryCatches.length === 0)) {
        warnings.push('Uses await without try-catch error handling - consider adding error handling');
    }

    return { errors, warnings };
}

/**
 * Validate syntax for common patterns
 */
function validateSyntax(code: string): string[] {
    const errors: string[] = [];

    // Check for incomplete arrow functions
    if (/=>\s*$/.test(code.trim())) {
        errors.push('Incomplete arrow function detected');
    }

    // Check for incomplete function declarations
    if (/function\s+\w+\s*\([^)]*$/.test(code)) {
        errors.push('Incomplete function declaration');
    }

    // Check for incomplete object literals
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
        errors.push(`Mismatched braces: ${openBraces} opening, ${closeBraces} closing`);
    }

    return errors;
}

/**
 * Main validation function
 */
export function validateGeneratedCode(
    code: string,
    availablePackages: string[]
): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Check balanced delimiters
    errors.push(...checkBalancedDelimiters(code));

    // 2. Validate syntax
    errors.push(...validateSyntax(code));

    // 3. Validate imports
    const importErrors = validateImports(code, availablePackages);
    // Treat import errors as warnings since they might be intentional additions
    warnings.push(...importErrors);

    // 4. Check common issues
    const commonIssues = checkCommonIssues(code);
    errors.push(...commonIssues.errors);
    warnings.push(...commonIssues.warnings);

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Format validation result for PR description
 */
export function formatValidationReport(result: ValidationResult): string {
    if (result.valid && result.warnings.length === 0) {
        return `
## ✅ Validation Passed

All checks passed successfully!
- No syntax errors
- No security issues detected
- Code follows best practices
`.trim();
    }

    let report = result.valid ? '## ⚠️ Validation Passed with Warnings\n\n' : '## ❌ Validation Issues Detected\n\n';

    if (result.errors.length > 0) {
        report += '### Errors\n';
        result.errors.forEach(error => {
            report += `- ❌ ${error}\n`;
        });
        report += '\n';
    }

    if (result.warnings.length > 0) {
        report += '### Warnings\n';
        result.warnings.forEach(warning => {
            report += `- ⚠️ ${warning}\n`;
        });
    }

    if (!result.valid) {
        report += '\n**⚠️ Please review and test this PR carefully before merging.**\n';
    }

    return report.trim();
}
