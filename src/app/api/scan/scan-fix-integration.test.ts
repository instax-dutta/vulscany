import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as scanPost } from './route';
import { POST as generatePrPost } from '../ai/generate-pr/route';
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
    rateLimit: vi.fn(),
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
    formatValidationReport: vi.fn(),
}));

vi.mock('@/lib/user/stats', () => ({
    incrementUserMetric: vi.fn(),
}));

const mockVulnerabilities = [
    {
        id: 'vuln-1',
        type: 'dangerous-api',
        severity: 'high' as const,
        title: 'Unsafe HTML',
        description: 'Using dangerouslySetInnerHTML',
        file: 'src/Component.tsx',
        line: 10,
        snippet: '<div dangerouslySetInnerHTML={{__html: data}} />',
        recommendation: 'Sanitize HTML before rendering'
    }
];

const mockFixResult = {
    filePath: 'src/Component.tsx',
    vulnerabilityId: 'vuln-1',
    fixedCode: 'import React...\n<div>{sanitize(data)}</div>',
    diff: '- <div dangerouslySetInnerHTML={{__html: data}} />\n+ <div>{sanitize(data)}</div>',
    commitMessage: 'fix(security): Unsafe HTML'
};

const mockValidation = {
    valid: true,
    errors: [] as string[],
    warnings: [] as string[]
};

const mockScanResult = {
    repoName: 'owner/repo',
    owner: 'owner',
    scanTimestamp: new Date().toISOString(),
    stackInfo: { stack: 'react', dependencies: { react: '18.0.0' } },
    vulnerabilities: mockVulnerabilities,
    status: 'vulnerabilities_found',
    summary: 'Found 1 vulnerability',
    scanDuration: 1500,
    threatIntelligence: {
        riskScore: 75,
        riskLevel: 'HIGH',
        cveCount: 2,
        advisoryCount: 1,
        scanFindingsCount: 1,
        criticalThreats: 1,
        recommendations: ['Update react to latest version'],
        displayInUI: true
    }
};

const mockCachedResult = {
    ...mockScanResult,
    cached: true
};

describe('Integration: /api/scan and /api/ai/generate-pr', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(rateLimit.rateLimit).mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: 0 });
    });

    describe('POST /api/scan', () => {
        it('returns 401 when unauthorized', async () => {
            vi.mocked(cookies).mockResolvedValue({
                get: vi.fn().mockReturnValue(undefined)
            } as any);

            const req = new NextRequest('http://localhost/api/scan', {
                method: 'POST',
                body: JSON.stringify({ owner: 'test', repo: 'test' })
            });

            const response = await scanPost(req);
            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data.error).toBe('Unauthorized');
        });

        it('returns 400 when owner or repo is missing', async () => {
            vi.mocked(cookies).mockResolvedValue({
                get: vi.fn().mockReturnValue({ value: 'gh_token' })
            } as any);

            const req = new NextRequest('http://localhost/api/scan', {
                method: 'POST',
                body: JSON.stringify({ owner: 'test' })
            });

            const response = await scanPost(req);
            expect(response.status).toBe(400);
        });

        it('returns 400 for non-web application', async () => {
            vi.mocked(cookies).mockResolvedValue({
                get: vi.fn().mockReturnValue({ value: 'gh_token' })
            } as any);

            vi.mocked(stackDetector.detectStack).mockResolvedValue(null);

            const req = new NextRequest('http://localhost/api/scan', {
                method: 'POST',
                body: JSON.stringify({ owner: 'test', repo: 'test' })
            });

            const response = await scanPost(req);
            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Not a Web application');
        });

        it('returns 429 when rate limited', async () => {
            vi.mocked(rateLimit.rateLimit).mockResolvedValue({
                success: false,
                limit: 30,
                remaining: 0,
                reset: 0
            });

            vi.mocked(cookies).mockResolvedValue({
                get: vi.fn().mockReturnValue({ value: 'gh_token' })
            } as any);

            const req = new NextRequest('http://localhost/api/scan', {
                method: 'POST',
                body: JSON.stringify({ owner: 'test', repo: 'test' })
            });

            const response = await scanPost(req);
            expect(response.status).toBe(429);
            const data = await response.json();
            expect(data.error).toBe('Too Many Requests');
        });

        it('returns cached result on cache hit', async () => {
            vi.mocked(cookies).mockResolvedValue({
                get: vi.fn().mockReturnValue({ value: 'gh_token' })
            } as any);

            vi.mocked(scanCache.getCachedScanResult).mockResolvedValue(mockCachedResult as any);

            const req = new NextRequest('http://localhost/api/scan', {
                method: 'POST',
                body: JSON.stringify({ owner: 'test', repo: 'test', force: false })
            });

            const response = await scanPost(req);
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.cached).toBe(true);
            expect(data.scanResult).toEqual(mockCachedResult);
            expect(scanner.scanRepository).not.toHaveBeenCalled();
        });

        it('bypasses cache and re-scans when force=true', async () => {
            vi.mocked(cookies).mockResolvedValue({
                get: vi.fn().mockReturnValue({ value: 'gh_token' })
            } as any);

            vi.mocked(scanCache.getCachedScanResult).mockResolvedValue(mockCachedResult as any);
            vi.mocked(stackDetector.detectStack).mockResolvedValue({
                stack: 'react',
                dependencies: { react: '18.0.0' }
            } as any);
            vi.mocked(scanner.scanRepository).mockResolvedValue(mockScanResult as any);
            vi.mocked(threatIntel.analyzeRepositoryThreats).mockResolvedValue({
                riskScore: 80,
                riskLevel: 'HIGH',
                cveMatches: [],
                advisoryMatches: [],
                recommendations: [],
                dependencyCount: 1,
                analyzedAt: new Date().toISOString()
            } as any);

            const req = new NextRequest('http://localhost/api/scan', {
                method: 'POST',
                body: JSON.stringify({ owner: 'test', repo: 'test', force: true })
            });

            const response = await scanPost(req);
            expect(response.status).toBe(200);
            expect(scanCache.invalidateScanCache).toHaveBeenCalledWith('test', 'test');
            expect(scanner.scanRepository).toHaveBeenCalled();
        });

        it('performs full happy path with threat intel and local-store logging', async () => {
            vi.mocked(cookies).mockResolvedValue({
                get: vi.fn().mockImplementation((name: string) => {
                    if (name === 'github_token') return { value: 'gh_token' };
                    if (name === 'session') return { value: JSON.stringify({ user: { id: 12345 } }) };
                    return undefined;
                })
            } as any);

            vi.mocked(stackDetector.detectStack).mockResolvedValue({
                stack: 'react',
                dependencies: { react: '18.0.0' }
            } as any);

            vi.mocked(scanner.scanRepository).mockResolvedValue(mockScanResult as any);

            vi.mocked(threatIntel.analyzeRepositoryThreats).mockResolvedValue({
                riskScore: 75,
                riskLevel: 'HIGH',
                cveMatches: [],
                advisoryMatches: [],
                recommendations: ['Update react'],
                dependencyCount: 1,
                analyzedAt: new Date().toISOString()
            } as any);

            const req = new NextRequest('http://localhost/api/scan', {
                method: 'POST',
                body: JSON.stringify({ owner: 'test', repo: 'test', force: false })
            });

            const response = await scanPost(req);
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.scanResult).toBeDefined();
            expect(data.scanResult.vulnerabilities).toHaveLength(1);
            expect(data.scanResult.status).toBe('vulnerabilities_found');
            expect(data.scanResult.scanDuration).toBe(1500);
            expect(data.threatIntelligence).toBeDefined();

            expect(localStore.addScanRecord).toHaveBeenCalledWith(
                expect.objectContaining({
                    githubId: 12345,
                    repoName: 'test/test',
                    vulnerabilitiesFound: 1
                })
            );
            expect(localStore.updateLastScan).toHaveBeenCalledWith(12345);
        });
    });

    describe('POST /api/ai/generate-pr', () => {
        it('returns 401 when unauthorized', async () => {
            vi.mocked(cookies).mockResolvedValue({
                get: vi.fn().mockReturnValue(undefined)
            } as any);

            const req = new NextRequest('http://localhost/api/ai/generate-pr', {
                method: 'POST',
                body: JSON.stringify({
                    owner: 'test',
                    repo: 'test',
                    vulnerabilities: mockVulnerabilities
                })
            });

            const response = await generatePrPost(req);
            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data.error).toBe('Unauthorized. Please log in with GitHub.');
        });

        it('returns 400 when owner is missing', async () => {
            vi.mocked(cookies).mockResolvedValue({
                get: vi.fn().mockReturnValue({ value: 'gh_token' })
            } as any);

            const req = new NextRequest('http://localhost/api/ai/generate-pr', {
                method: 'POST',
                body: JSON.stringify({
                    vulnerabilities: []
                })
            });

            const response = await generatePrPost(req);
            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Missing required fields: owner, repo, vulnerabilities');
        });

        it('returns 400 when vulnerabilities is missing or empty', async () => {
            vi.mocked(cookies).mockResolvedValue({
                get: vi.fn().mockReturnValue({ value: 'gh_token' })
            } as any);

            const req = new NextRequest('http://localhost/api/ai/generate-pr', {
                method: 'POST',
                body: JSON.stringify({
                    owner: 'test',
                    repo: 'test'
                })
            });

            const response = await generatePrPost(req);
            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Missing required fields: owner, repo, vulnerabilities');
        });

        it('returns 500 when generateBatchFixes returns empty array', async () => {
            vi.mocked(cookies).mockResolvedValue({
                get: vi.fn().mockReturnValue({ value: 'gh_token' })
            } as any);

            vi.mocked(githubClient.getFileContent).mockResolvedValue({
                content: 'source code'
            } as any);

            vi.mocked(prContext.getProjectContext).mockResolvedValue({
                dependencies: {},
                devDependencies: {},
                framework: { name: 'react' },
                fileImports: []
            } as any);

            vi.mocked(prContext.buildContextString).mockReturnValue('context string');

            vi.mocked(fixGenerator.generateBatchFixes).mockResolvedValue([]);

            const req = new NextRequest('http://localhost/api/ai/generate-pr', {
                method: 'POST',
                body: JSON.stringify({
                    owner: 'test',
                    repo: 'test',
                    vulnerabilities: mockVulnerabilities,
                    mode: 'preview'
                })
            });

            const response = await generatePrPost(req);
            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data.error).toBe('No fixes could be generated');
        });

        it('returns preview fixes with validation in preview mode', async () => {
            vi.mocked(cookies).mockResolvedValue({
                get: vi.fn().mockReturnValue({ value: 'gh_token' })
            } as any);

            vi.mocked(githubClient.getFileContent).mockResolvedValue({
                content: 'source code'
            } as any);

            vi.mocked(prContext.getProjectContext).mockResolvedValue({
                dependencies: { react: '18.0.0' },
                devDependencies: {},
                framework: { name: 'react' },
                fileImports: []
            } as any);

            vi.mocked(prContext.buildContextString).mockReturnValue('context string');

            vi.mocked(fixGenerator.generateBatchFixes).mockResolvedValue([mockFixResult]);

            vi.mocked(codeValidator.validateGeneratedCode).mockReturnValue(mockValidation);

            const req = new NextRequest('http://localhost/api/ai/generate-pr', {
                method: 'POST',
                body: JSON.stringify({
                    owner: 'test',
                    repo: 'test',
                    vulnerabilities: mockVulnerabilities,
                    mode: 'preview'
                })
            });

            const response = await generatePrPost(req);
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.mode).toBe('preview');
            expect(data.fixes).toHaveLength(1);
            expect(data.fixes[0].filePath).toBe('src/Component.tsx');
            expect(data.fixes[0].diff).toBeDefined();
            expect(data.fixes[0].commitMessage).toBe('fix(security): Unsafe HTML');
            expect(data.fixes[0].validation).toEqual(mockValidation);
            expect(data.validationSummary).toBeDefined();
            expect(data.validationSummary.hasErrors).toBe(false);
            expect(data.totalFiles).toBe(1);
        });
    });
});
