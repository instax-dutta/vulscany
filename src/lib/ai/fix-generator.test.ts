import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateCodeFix, generateBatchFixes } from './fix-generator';
import type { Vulnerability } from '../scanner';

// Mock Mistral AI API
global.fetch = vi.fn();

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

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{
                        message: { content: mockAIResponse }
                    }]
                })
            } as Response);

            const result = await generateCodeFix(mockVulnerability, mockFileContent);

            expect(result).toMatchObject({
                filePath: 'src/Component.tsx',
                vulnerabilityId: 'vuln-001',
            });
            expect(result.fixedCode).toContain('DOMPurify.sanitize');
        });

        it('should strip markdown code blocks from AI response', async () => {
            const mockAIResponse = '```typescript\nimport React from "react";\n```';

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{
                        message: { content: mockAIResponse }
                    }]
                })
            } as Response);

            const result = await generateCodeFix(mockVulnerability, mockFileContent);

            expect(result.fixedCode).not.toContain('```');
            expect(result.fixedCode).toContain('import React');
        });

        it('should fallback to pattern fix if AI fails', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('API error'));

            const result = await generateCodeFix(mockVulnerability, mockFileContent);

            // Should still produce a fix using pattern matching
            expect(result.fixedCode).toBeDefined();
            expect(result.fixedCode.length).toBeGreaterThan(0);
        });

        it('should use random API key from pool', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: 'fixed code' } }]
                })
            } as Response);

            await generateCodeFix(mockVulnerability, mockFileContent);

            const callArgs = vi.mocked(fetch).mock.calls[0];
            const headers = callArgs[1]?.headers as Record<string, string>;
            expect(headers.Authorization).toMatch(/Bearer mock-key-[12]/);
        });
    });

    describe('Pattern-Based Fixes', () => {
        it('should add DOMPurify import if missing', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('API unavailable'));

            const result = await generateCodeFix(mockVulnerability, mockFileContent);

            expect(result.fixedCode).toContain("import DOMPurify from 'dompurify'");
        });

        it('should wrap dangerouslySetInnerHTML with DOMPurify', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('API unavailable'));

            const result = await generateCodeFix(mockVulnerability, mockFileContent);

            expect(result.fixedCode).toMatch(/DOMPurify\.sanitize\(userInput\)/);
        });

        it('should not double-wrap already sanitized HTML', async () => {
            const alreadySanitized = `
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
            `;

            vi.mocked(fetch).mockRejectedValueOnce(new Error('API unavailable'));

            const result = await generateCodeFix(mockVulnerability, alreadySanitized);

            const sanitizeCount = (result.fixedCode.match(/DOMPurify\.sanitize/g) || []).length;
            expect(sanitizeCount).toBeLessThanOrEqual(1);
        });
    });

    describe('Validation', () => {
        it('should reject AI response that is too short', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{
                        message: { content: 'x' } // Too short
                    }]
                })
            } as Response);

            const result = await generateCodeFix(mockVulnerability, mockFileContent);

            // Should fall back to pattern fix
            expect(result.fixedCode.length).toBeGreaterThan(10);
        });

        it('should reject AI response that does not look like code', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{
                        message: { content: 'This is just text without any code keywords' }
                    }]
                })
            } as Response);

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

            vi.mocked(fetch).mockResolvedValue({
                ok: true,
                json: async () => ({
                    choices: [{
                        message: { content: mockFileContent.replace('userInput', 'DOMPurify.sanitize(userInput)') }
                    }]
                })
            } as Response);

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
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{
                        message: {
                            content: mockFileContent.replace(
                                'dangerouslySetInnerHTML={{ __html: userInput }}',
                                'dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }}'
                            )
                        }
                    }]
                })
            } as Response);

            const result = await generateCodeFix(mockVulnerability, mockFileContent);

            expect(result.diff).toContain('- ');
            expect(result.diff).toContain('+ ');
            expect(result.diff).toContain('DOMPurify');
        });
    });

    describe('Commit Messages', () => {
        it('should generate semantic commit message', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: 'fixed' } }]
                })
            } as Response);

            const result = await generateCodeFix(mockVulnerability, mockFileContent);

            expect(result.commitMessage).toContain('fix(security):');
            expect(result.commitMessage).toContain('Unsafe HTML Rendering');
            expect(result.commitMessage).toContain('Severity: high');
        });
    });
});
