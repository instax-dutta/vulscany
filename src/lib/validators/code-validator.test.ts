import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateGeneratedCode } from './code-validator';

describe('Code Validator', () => {
    describe('Basic Validation', () => {
        it('should pass for valid TypeScript code', () => {
            const code = `
import React from 'react';
export function Component() {
    return <div>Hello</div>;
}
            `;
            const result = validateGeneratedCode(code, ['react']);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject empty code', () => {
            const result = validateGeneratedCode('', []);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Generated code is empty');
        });
    });

    describe('Brace Balance Validation', () => {
        it('should detect unbalanced curly braces', () => {
            const code = `
function test() {
    if (true) {
        console.log('missing brace');
    // Missing closing brace
}
            `;
            const result = validateGeneratedCode(code, []);
            expect(result.valid).toBe(false);
            expect(result.errors[0]).toContain('Unbalanced braces');
        });

        it('should detect unbalanced parentheses', () => {
            const code = `function test(a, b { return a + b; }`;
            const result = validateGeneratedCode(code, []);
            expect(result.valid).toBe(false);
            expect(result.errors[0].toLowerCase()).toContain('unbalanced parentheses');
        });
    });

    describe('Dependency Validation', () => {
        it('should warn about missing dependencies', () => {
            const code = `import DOMPurify from 'dompurify';`;
            const result = validateGeneratedCode(code, ['react', 'next']);
            expect(result.warnings).toEqual(
                expect.arrayContaining([
                    expect.stringContaining("'dompurify' is imported but not found")
                ])
            );
        });

        it('should allow dependencies that exist in package.json', () => {
            const code = `import React from 'react';`;
            const result = validateGeneratedCode(code, ['react', 'next']);
            expect(result.warnings).not.toEqual(
                expect.arrayContaining([
                    expect.stringContaining('react')
                ])
            );
        });

        it('should ignore relative imports', () => {
            const code = `import { MyComponent } from './components/MyComponent';`;
            const result = validateGeneratedCode(code, []);
            expect(result.valid).toBe(true);
        });

        it('should ignore built-in packages', () => {
            const code = `
import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
            `;
            const result = validateGeneratedCode(code, ['react']);
            expect(result.valid).toBe(true);
        });
    });

    describe('JSX Validation', () => {
        it('should detect excessive JSX brace nesting', () => {
            const code = `<div>{{{{nested}}}}</div>`;
            const result = validateGeneratedCode(code, []);
            expect(result.warnings).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('JSX brace nesting issue')
                ])
            );
        });
    });

    describe('React Hook Rules', () => {
        it('should detect hooks inside conditionals', () => {
            const code = `
function Component() {
    if (condition) {
        const [state, setState] = useState(0);
    }
}
            `;
            const result = validateGeneratedCode(code, []);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('React hooks cannot be called inside conditions or loops');
        });

        it('should allow hooks at top level', () => {
            const code = `
function Component() {
    const [state, setState] = useState(0);
    useEffect(() => {}, []);
    return <div>{state}</div>;
}
            `;
            const result = validateGeneratedCode(code, []);
            expect(result.errors).not.toEqual(
                expect.arrayContaining([
                    expect.stringContaining('hooks')
                ])
            );
        });
    });

    describe('TypeScript Validation', () => {
        it('should warn about excessive any types', () => {
            const code = `
function test1(a: any, b: any): any { return a; }
function test2(a: any, b: any): any { return b; }
function test3(a: any): any { return a; }
            `;
            const result = validateGeneratedCode(code, []);
            expect(result.warnings).toEqual(
                expect.arrayContaining([
                    expect.stringContaining("Excessive use of 'any' type")
                ])
            );
        });

        it('should allow reasonable any usage', () => {
            const code = `function test(data: any) { return data; }`;
            const result = validateGeneratedCode(code, []);
            expect(result.valid).toBe(true);
            expect(result.warnings).not.toEqual(
                expect.arrayContaining([
                    expect.stringContaining('any')
                ])
            );
        });
    });

    describe('Security Regression Detection', () => {
        it('should detect eval() usage', () => {
            const code = `const result = eval("1 + 1");`;
            const result = validateGeneratedCode(code, []);
            expect(result.valid).toBe(false);
            expect(result.errors).toEqual(
                expect.arrayContaining([
                    expect.stringContaining("eval()")
                ])
            );
        });

        it('should detect new Function() usage', () => {
            const code = `const fn = new Function('a', 'b', 'return a + b');`;
            const result = validateGeneratedCode(code, []);
            expect(result.valid).toBe(false);
            expect(result.errors).toEqual(
                expect.arrayContaining([
                    expect.stringContaining("new Function()")
                ])
            );
        });

        it('should detect dangerouslySetInnerHTML without DOMPurify', () => {
            const code = `<div dangerouslySetInnerHTML={{ __html: userInput }} />`;
            const result = validateGeneratedCode(code, []);
            expect(result.valid).toBe(false);
            expect(result.errors).toEqual(
                expect.arrayContaining([
                    expect.stringContaining("dangerouslySetInnerHTML without sanitization")
                ])
            );
        });

        it('should allow dangerouslySetInnerHTML with DOMPurify', () => {
            const code = `<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />`;
            const result = validateGeneratedCode(code, []);
            expect(result.valid).toBe(true);
        });
    });

    describe('Incomplete Code Detection', () => {
        it('should detect TODO comments', () => {
            const code = `
function test() {
    // TODO: implement this
    return null;
}
            `;
            const result = validateGeneratedCode(code, []);
            expect(result.valid).toBe(false);
            expect(result.errors).toEqual(
                expect.arrayContaining([
                    expect.stringContaining("placeholder '// TODO'")
                ])
            );
        });

        it('should detect FIXME comments', () => {
            const code = `// FIXME: broken logic`;
            const result = validateGeneratedCode(code, []);
            expect(result.valid).toBe(false);
        });

        it('should detect rest of code placeholder', () => {
            const code = `function test() { /* rest of code */ }`;
            const result = validateGeneratedCode(code, []);
            expect(result.valid).toBe(false);
        });

        it('should allow spread operator', () => {
            const code = `const arr = [...oldArr, newItem];`;
            const result = validateGeneratedCode(code, []);
            expect(result.valid).toBe(true);
        });
    });

    describe('Function Return Validation', () => {
        it('should warn about missing return statements', () => {
            const code = `function getValue(): string {}`;
            const result = validateGeneratedCode(code, []);
            expect(result.warnings).toEqual(
                expect.arrayContaining([
                    expect.stringContaining("missing return statement")
                ])
            );
        });

        it('should not warn for void functions', () => {
            const code = `function log(): void { console.log('test'); }`;
            const result = validateGeneratedCode(code, []);
            expect(result.warnings).not.toEqual(
                expect.arrayContaining([
                    expect.stringContaining("return")
                ])
            );
        });
    });
});
