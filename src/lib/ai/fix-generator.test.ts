import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateCodeFix, generateBatchFixes } from './fix-generator';
import type { Vulnerability } from '../scanner';
import { server } from '../../../vitest.setup';
import { http, HttpResponse } from 'msw';

describe('Fix Generator', () => {
    const mockVulnerability: Vulnerability = {
        id: 'vuln-001',
        type: 'dangerous-api',
        severity: 'high',
        title: 'Unsafe HTML Rendering (React)',
        description: 'Using dangerouslySetInnerHTML without sanitization',
        file: 'src/Component.tsx',
        line: 10,
        snippet: '<div dangerouslySetInnerHTML={{ __html: userInput }} />',
        recommendation: 'Use DOMPurify.sanitize() to sanitize HTML before rendering'
    };

    const mockFileContent = `
import React from 'react';

export function Component({ userInput }: { userInput: string }) {
    return (
        <div dangerouslySetInnerHTML={{ __html: userInput }} />
    );
}
`;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.MISTRAL_API_KEYS = 'mock-key-1,mock-key-2';
    });

    describe('AI Fix Generation', () => {
        it('should generate a fix using Mistral AI', async () => {
            const mockAIResponse = `
import React from 'react';
import DOMPurify from 'dompurify';

export function Component({ userInput }: { userInput: string }) {
    return (
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
    );
}
`;

            server.use(
                http.post('https://api.mistral.ai/v1/chat/completions', () => {
                    return HttpResponse.json({
                        choices: [{ message: { content: mockAIResponse } }]
                    });
                })
            );

            const result = await generateCodeFix(mockVulnerability, mockFileContent);

            expect(result).toMatchObject({
                filePath: 'src/Component.tsx',
                vulnerabilityId: 'vuln-001',
            });
            expect(result.fixedCode).toContain('DOMPurify.sanitize');
        });

        it('should strip markdown code blocks from AI response', async () => {
            const mockAIResponse = '```typescript\nimport React from "react";\n```';

            server.use(
                http.post('https://api.mistral.ai/v1/chat/completions', () => {
                    return HttpResponse.json({
                        choices: [{ message: { content: mockAIResponse } }]
                    });
                })
            );

            const result = await generateCodeFix(mockVulnerability, mockFileContent);

            expect(result.fixedCode).not.toContain('```');
            expect(result.fixedCode).toContain('import React');
        });

        it('should fallback to pattern fix if AI fails', async () => {
            server.use(
                http.post('https://api.mistral.ai/v1/chat/completions', () => {
                    return new HttpResponse(null, { status: 500 });
                })
            );

            const result = await generateCodeFix(mockVulnerability, mockFileContent);

            // Should still produce a fix using pattern matching
            expect(result.fixedCode).toBeDefined();
            expect(result.fixedCode.length).toBeGreaterThan(0);
        });

        it('should use random API key from pool', async () => {
            let capturedKey = '';
            server.use(
                http.post('https://api.mistral.ai/v1/chat/completions', ({ request }) => {
                    capturedKey = request.headers.get('Authorization') || '';
                    return HttpResponse.json({
                        choices: [{ message: { content: 'function fix() {}' } }]
                    });
                })
            );

            await generateCodeFix(mockVulnerability, mockFileContent);

            expect(capturedKey).toMatch(/Bearer mock-key-[12]/);
        });
    });

    describe('Pattern-Based Fixes', () => {
        it('should add DOMPurify import if missing', async () => {
            server.use(
                http.post('https://api.mistral.ai/v1/chat/completions', () => {
                    return new HttpResponse(null, { status: 500 });
                })
            );

            const result = await generateCodeFix(mockVulnerability, mockFileContent);

            expect(result.fixedCode).toContain("import DOMPurify from 'dompurify'");
        });

        it('should wrap dangerouslySetInnerHTML with DOMPurify', async () => {
            server.use(
                http.post('https://api.mistral.ai/v1/chat/completions', () => {
                    return new HttpResponse(null, { status: 500 });
                })
            );

            const result = await generateCodeFix(mockVulnerability, mockFileContent);

            expect(result.fixedCode).toMatch(/DOMPurify\.sanitize\(userInput\)/);
        });

        it('should not double-wrap already sanitized HTML', async () => {
            const alreadySanitized = `
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
            `;

            server.use(
                http.post('https://api.mistral.ai/v1/chat/completions', () => {
                    return new HttpResponse(null, { status: 500 });
                })
            );

            const result = await generateCodeFix(mockVulnerability, alreadySanitized);

            const sanitizeCount = (result.fixedCode.match(/DOMPurify\.sanitize/g) || []).length;
            expect(sanitizeCount).toBeLessThanOrEqual(1);
        });
    });

    describe('Validation', () => {
        it('should reject AI response that is too short', async () => {
            server.use(
                http.post('https://api.mistral.ai/v1/chat/completions', () => {
                    return HttpResponse.json({
                        choices: [{ message: { content: 'x' } }]
                    });
                })
            );

            const result = await generateCodeFix(mockVulnerability, mockFileContent);

            // Should fall back to pattern fix
            expect(result.fixedCode.length).toBeGreaterThan(10);
        });

        it('should reject AI response that does not look like code', async () => {
            server.use(
                http.post('https://api.mistral.ai/v1/chat/completions', () => {
                    return HttpResponse.json({
                        choices: [{ message: { content: 'This is just text without any code keywords' } }]
                    });
                })
            );

            const result = await generateCodeFix(mockVulnerability, mockFileContent);

            // Should fall back to pattern fix
            expect(result.fixedCode).toMatch(/import|export|function|const|class/);
        });
    });

    describe('Batch Fixes', () => {
        it('should generate fixes for multiple vulnerabilities', async () => {
            const vulnerabilities: Vulnerability[] = [
                mockVulnerability,
                {
                    ...mockVulnerability,
                    id: 'vuln-002',
                    line: 15
                }
            ];

            const fileContents = new Map([
                ['src/Component.tsx', mockFileContent]
            ]);

            server.use(
                http.post('https://api.mistral.ai/v1/chat/completions', () => {
                    return HttpResponse.json({
                        choices: [{
                            message: { content: mockFileContent.replace('userInput', 'DOMPurify.sanitize(userInput)') }
                        }]
                    });
                })
            );

            const results = await generateBatchFixes(vulnerabilities, fileContents);

            expect(results).toHaveLength(1);
            expect(results[0].vulnerabilityId).toContain('vuln-001');
            expect(results[0].vulnerabilityId).toContain('vuln-002');
        });

        it('should skip files with no content', async () => {
            const vulnerabilities: Vulnerability[] = [mockVulnerability];
            const fileContents = new Map<string, string>();

            const results = await generateBatchFixes(vulnerabilities, fileContents);

            expect(results).toHaveLength(0);
        });
    });

    describe('Diff Generation', () => {
        it('should generate meaningful diff', async () => {
            server.use(
                http.post('https://api.mistral.ai/v1/chat/completions', () => {
                    return HttpResponse.json({
                        choices: [{
                            message: {
                                content: mockFileContent.replace(
                                    'dangerouslySetInnerHTML={{ __html: userInput }}',
                                    'dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }}'
                                )
                            }
                        }]
                    });
                })
            );

            const result = await generateCodeFix(mockVulnerability, mockFileContent);

            expect(result.diff).toContain('- ');
            expect(result.diff).toContain('+ ');
            expect(result.diff).toContain('DOMPurify');
        });
    });

    describe('Commit Messages', () => {
        it('should generate semantic commit message', async () => {
            server.use(
                http.post('https://api.mistral.ai/v1/chat/completions', () => {
                    return HttpResponse.json({
                        choices: [{ message: { content: 'function fix() {}' } }]
                    });
                })
            );

            const result = await generateCodeFix(mockVulnerability, mockFileContent);

            expect(result.commitMessage).toContain('fix(security):');
            expect(result.commitMessage).toContain('Unsafe HTML Rendering');
            expect(result.commitMessage).toContain('Severity: high');
        });
    });
});
