import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as scanPost } from '@/app/api/scan/route';
import { POST as generatePrPost } from '@/app/api/ai/generate-pr/route';
import { cookies } from 'next/headers';
import * as scanner from '@/lib/scanner';
import * as stackDetector from '@/lib/github/stack-detector';
import * as scanCache from '@/lib/cache/scan-cache';
import * as localStore from '@/lib/local-store';
import * as rateLimit from '@/lib/rate-limit';
import * as threatIntel from '@/lib/threat-intel';
import * as fixGenerator from '@/lib/ai/fix-generator';
import * as prCreator from '@/lib/github/pr-creator';
import * as githubClient from '@/lib/github/client';
import * as prContext from '@/lib/ai/pr-context';
import * as codeValidator from '@/lib/validators/code-validator';
import * as userStats from '@/lib/user/stats';
import { NextRequest } from 'next/server';

vi.mock('next/headers', () => ({
    cookies: vi.fn(),
}));

vi.mock('@/lib/scanner', () => ({
    scanRepository: vi.fn(),
}));

vi.mock('@/lib/github/stack-detector', () => ({
    detectStack: vi.fn(),
}));

vi.mock('@/lib/cache/scan-cache', () => ({
    getCachedScanResult: vi.fn().mockResolvedValue(null),
    cacheScanResult: vi.fn().mockResolvedValue(true),
    invalidateScanCache: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/rate-limit', () => ({
    rateLimit: vi.fn().mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: 0 }),
}));

vi.mock('@/lib/local-store', () => ({
    addScanRecord: vi.fn(),
    updateLastScan: vi.fn(),
}));

vi.mock('@/lib/threat-intel', () => ({
    analyzeRepositoryThreats: vi.fn(),
}));

vi.mock('@/lib/ai/fix-generator', () => ({
    generateBatchFixes: vi.fn(),
}));

vi.mock('@/lib/github/pr-creator', () => ({
    createSecurityFixPR: vi.fn(),
}));

vi.mock('@/lib/github/client', () => ({
    getFileContent: vi.fn(),
}));

vi.mock('@/lib/ai/pr-context', () => ({
    getProjectContext: vi.fn(),
    buildContextString: vi.fn(),
}));

vi.mock('@/lib/validators/code-validator', () => ({
    validateGeneratedCode: vi.fn(),
}));

vi.mock('@/lib/user/stats', () => ({
    incrementUserMetric: vi.fn(),
}));

const mockScanResult = {
    repoName: 'test-repo',
    owner: 'test',
    scanTimestamp: '2024-01-01T00:00:00Z',
    stackInfo: { stack: 'react', dependencies: { react: '18.0.0' } },
    vulnerabilities: [
        {
            id: 'vuln-1',
            type: 'dangerous-api' as const,
            severity: 'high' as const,
            title: 'Unsafe HTML',
            description: 'test',
            file: 'src/Component.tsx',
            line: 10,
            snippet: '...',
            recommendation: 'Fix it',
        },
    ],
    status: 'needs-attention' as const,
    summary: 'Found 1 vulnerability',
    scanDuration: 1500,
};

const mockThreatIntel = {
    cveMatches: [{ id: 'CVE-2024-0001', severity: 'HIGH', cvssScore: 7.5 }],
    advisoryMatches: [],
    riskScore: 50,
    riskLevel: 'HIGH' as const,
    threatSummary: 'Test',
    recommendations: ['Fix it'],
    lastUpdated: '2024-01-01T00:00:00Z',
};

const mockVulnerabilities = [
    {
        id: 'vuln-1',
        type: 'dangerous-api' as const,
        severity: 'high' as const,
        title: 'Unsafe HTML',
        description: 'test',
        file: 'src/Component.tsx',
        line: 10,
        snippet: '...',
        recommendation: 'Fix it',
    },
];

const mockFixResult = {
    filePath: 'src/Component.tsx',
    vulnerabilityId: 'vuln-1',
    fixedCode: 'import React...',
    diff: '- old\n+ new',
    commitMessage: 'fix(security): Unsafe HTML',
};

const mockValidation = {
    valid: true,
    errors: [],
    warnings: [],
};

describe('Integration: Scan-Fix Pipeline', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(cookies).mockResolvedValue({
            get: vi.fn().mockImplementation((name: string) => {
                if (name === 'github_token') return { value: 'gh_token' };
                if (name === 'session') return { value: JSON.stringify({ user: { id: 12345 } }) };
                return undefined;
            }),
        } as any);
        vi.mocked(rateLimit.rateLimit).mockResolvedValue({
            success: true,
            limit: 10,
            remaining: 9,
            reset: 0,
        });
    });

    describe('Scan endpoint', () => {
        it('returns scan result with threat intelligence on happy path', async () => {
            vi.mocked(stackDetector.detectStack).mockResolvedValue({
                stack: 'react',
                dependencies: { react: '18.0.0' },
            } as any);
            vi.mocked(scanner.scanRepository).mockResolvedValue(mockScanResult as any);
            vi.mocked(threatIntel.analyzeRepositoryThreats).mockResolvedValue(mockThreatIntel as any);

            const req = new NextRequest('http://localhost/api/scan', {
                method: 'POST',
                body: JSON.stringify({ owner: 'test', repo: 'test-repo' }),
            });

            const response = await scanPost(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.scanResult).toBeDefined();
            expect(data.scanResult.vulnerabilities).toEqual(mockScanResult.vulnerabilities);
            expect(data.scanResult.threatIntelligence).toBeDefined();
            expect(data.scanResult.threatIntelligence.riskScore).toBe(50);
            expect(data.scanResult.threatIntelligence.riskLevel).toBe('HIGH');
            expect(localStore.addScanRecord).toHaveBeenCalledWith(
                expect.objectContaining({
                    githubId: 12345,
                    repoName: 'test/test-repo',
                    vulnerabilitiesFound: 1,
                })
            );
            expect(localStore.updateLastScan).toHaveBeenCalledWith(12345);
        });

        it('returns 401 without auth', async () => {
            vi.mocked(cookies).mockResolvedValue({
                get: vi.fn().mockReturnValue(undefined),
            } as any);

            const req = new NextRequest('http://localhost/api/scan', {
                method: 'POST',
                body: JSON.stringify({ owner: 'test', repo: 'test' }),
            });

            const response = await scanPost(req);
            expect(response.status).toBe(401);
        });

        it('returns 400 without owner/repo', async () => {
            vi.mocked(cookies).mockResolvedValue({
                get: vi.fn().mockReturnValue({ value: 'token' }),
            } as any);

            const req = new NextRequest('http://localhost/api/scan', {
                method: 'POST',
                body: JSON.stringify({}),
            });

            const response = await scanPost(req);
            expect(response.status).toBe(400);
        });

        it('returns 400 for non-web application', async () => {
            vi.mocked(stackDetector.detectStack).mockResolvedValue(null as any);

            const req = new NextRequest('http://localhost/api/scan', {
                method: 'POST',
                body: JSON.stringify({ owner: 'test', repo: 'test' }),
            });

            const response = await scanPost(req);
            expect(response.status).toBe(400);
        });

        it('returns 429 when rate limited', async () => {
            vi.mocked(rateLimit.rateLimit).mockResolvedValue({
                success: false,
                limit: 10,
                remaining: 0,
                reset: 0,
            });

            const req = new NextRequest('http://localhost/api/scan', {
                method: 'POST',
                body: JSON.stringify({ owner: 'test', repo: 'test' }),
            });

            const response = await scanPost(req);
            expect(response.status).toBe(429);
        });

        it('returns cached result without re-scanning', async () => {
            const cachedResult = {
                ...mockScanResult,
                cached: true,
                cacheTimestamp: '2024-01-01T00:00:00Z',
            };
            vi.mocked(scanCache.getCachedScanResult).mockResolvedValue(cachedResult as any);

            const req = new NextRequest('http://localhost/api/scan', {
                method: 'POST',
                body: JSON.stringify({ owner: 'test', repo: 'test' }),
            });

            const response = await scanPost(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.cached).toBe(true);
            expect(data.scanResult).toEqual(cachedResult);
            expect(scanner.scanRepository).not.toHaveBeenCalled();
        });

        it('invalidates cache and re-scans on force=true', async () => {
            vi.mocked(stackDetector.detectStack).mockResolvedValue({
                stack: 'react',
                dependencies: { react: '18.0.0' },
            } as any);
            vi.mocked(scanner.scanRepository).mockResolvedValue(mockScanResult as any);

            const req = new NextRequest('http://localhost/api/scan', {
                method: 'POST',
                body: JSON.stringify({ owner: 'test', repo: 'test', force: true }),
            });

            const response = await scanPost(req);
            expect(response.status).toBe(200);
            expect(scanCache.invalidateScanCache).toHaveBeenCalledWith('test', 'test');
            expect(scanner.scanRepository).toHaveBeenCalled();
        });
    });

    describe('Generate PR endpoint', () => {
        it('returns 401 without auth', async () => {
            vi.mocked(cookies).mockResolvedValue({
                get: vi.fn().mockReturnValue(undefined),
            } as any);

            const req = new NextRequest('http://localhost/api/ai/generate-pr', {
                method: 'POST',
                body: JSON.stringify({
                    owner: 'test',
                    repo: 'test',
                    vulnerabilities: mockVulnerabilities,
                }),
            });

            const response = await generatePrPost(req);
            expect(response.status).toBe(401);
        });

        it('returns 400 without owner', async () => {
            vi.mocked(cookies).mockResolvedValue({
                get: vi.fn().mockReturnValue({ value: 'gh_token' }),
            } as any);

            const req = new NextRequest('http://localhost/api/ai/generate-pr', {
                method: 'POST',
                body: JSON.stringify({
                    vulnerabilities: mockVulnerabilities,
                }),
            });

            const response = await generatePrPost(req);
            expect(response.status).toBe(400);
        });

        it('returns 400 without vulnerabilities', async () => {
            vi.mocked(cookies).mockResolvedValue({
                get: vi.fn().mockReturnValue({ value: 'gh_token' }),
            } as any);

            const req = new NextRequest('http://localhost/api/ai/generate-pr', {
                method: 'POST',
                body: JSON.stringify({
                    owner: 'test',
                    repo: 'test',
                }),
            });

            const response = await generatePrPost(req);
            expect(response.status).toBe(400);
        });

        it('returns 500 when generateBatchFixes returns empty', async () => {
            vi.mocked(fixGenerator.generateBatchFixes).mockResolvedValue([]);
            vi.mocked(githubClient.getFileContent).mockResolvedValue({
                content: 'source code',
            } as any);

            const req = new NextRequest('http://localhost/api/ai/generate-pr', {
                method: 'POST',
                body: JSON.stringify({
                    owner: 'test',
                    repo: 'test',
                    vulnerabilities: mockVulnerabilities,
                    mode: 'preview',
                }),
            });

            const response = await generatePrPost(req);
            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data.error).toContain('Failed to generate PR');
        });

        it('returns fixes with validation in preview mode', async () => {
            vi.mocked(githubClient.getFileContent).mockResolvedValue({
                content: 'source code',
            } as any);
            vi.mocked(prContext.getProjectContext).mockResolvedValue({
                dependencies: {},
                devDependencies: {},
                framework: { name: 'react' },
                fileImports: [],
            } as any);
            vi.mocked(prContext.buildContextString).mockReturnValue('context');
            vi.mocked(fixGenerator.generateBatchFixes).mockResolvedValue([mockFixResult]);
            vi.mocked(codeValidator.validateGeneratedCode).mockReturnValue(mockValidation);

            const req = new NextRequest('http://localhost/api/ai/generate-pr', {
                method: 'POST',
                body: JSON.stringify({
                    owner: 'test',
                    repo: 'test',
                    vulnerabilities: mockVulnerabilities,
                    mode: 'preview',
                }),
            });

            const response = await generatePrPost(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.mode).toBe('preview');
            expect(data.fixes).toHaveLength(1);
            expect(data.fixes[0]).toEqual(
                expect.objectContaining({
                    filePath: 'src/Component.tsx',
                    diff: '- old\n+ new',
                    commitMessage: 'fix(security): Unsafe HTML',
                    validation: expect.objectContaining({ valid: true }),
                })
            );
            expect(data.validationSummary).toEqual(
                expect.objectContaining({
                    hasErrors: false,
                    totalWarnings: 0,
                })
            );
        });
    });
});
