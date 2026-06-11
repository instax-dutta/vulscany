import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CVEData, GitHubAdvisory, ThreatIntelligence, PackageVulnerability } from './types';

// Mock internal dependencies
vi.mock('./memory-cache', () => ({
    getCachedThreatData: vi.fn(),
    setCachedThreatData: vi.fn(),
}));
vi.mock('./cve-fetcher', () => ({
    fetchReactCVEs: vi.fn(),
}));
vi.mock('./github-advisories', () => ({
    fetchReactAdvisories: vi.fn(),
}));
vi.mock('./risk-analyzer', () => ({
    generateThreatIntelligence: vi.fn(),
    analyzePackageRisk: vi.fn(),
}));

// Module under test
import { hashDependencies, getLatestThreats, analyzeRepositoryThreats, getPackageVulnerabilities, prewarmThreatCache } from './index';
import * as memoryCache from './memory-cache';
import * as cveFetcher from './cve-fetcher';
import * as githubAdvisories from './github-advisories';
import * as riskAnalyzer from './risk-analyzer';

// ---------------------------------------------------------------------------
// Task 1: hashDependencies pure function tests
// ---------------------------------------------------------------------------

describe('hashDependencies', () => {
    it('is deterministic - same input produces same output', () => {
        const result1 = hashDependencies({ react: '18.0.0', next: '14.0.0' });
        const result2 = hashDependencies({ react: '18.0.0', next: '14.0.0' });
        expect(result1).toBe(result2);
    });

    it('produces different hashes for different inputs', () => {
        const result1 = hashDependencies({ react: '18.0.0' });
        const result2 = hashDependencies({ react: '19.0.0' });
        expect(result1).not.toBe(result2);
    });

    it('sorts keys alphabetically before hashing', () => {
        const result1 = hashDependencies({ b: '2', a: '1' });
        const result2 = hashDependencies({ a: '1', b: '2' });
        expect(result1).toBe(result2);
    });

    it('output is 12-character hex string', () => {
        const result = hashDependencies({ react: '18.0.0', next: '14.0.0' });
        expect(result).toMatch(/^[0-9a-f]{12}$/);
        expect(result).toHaveLength(12);
    });

    it('handles empty object', () => {
        const result = hashDependencies({});
        expect(result).toMatch(/^[0-9a-f]{12}$/);
        expect(result).toHaveLength(12);
    });
});

// ---------------------------------------------------------------------------
// Task 2: Orchestrator function tests
// ---------------------------------------------------------------------------

describe('Orchestrator Functions', () => {
    const mockCVEs: CVEData[] = [
        {
            id: 'CVE-2024-0001',
            description: 'Test CVE description',
            severity: 'HIGH',
            cvssScore: 7.5,
            publishedDate: '2024-01-01',
            lastModifiedDate: '2024-01-15',
            affectedPackages: ['react'],
            references: [],
        },
    ];

    const mockAdvisories: GitHubAdvisory[] = [
        {
            id: 'GHSA-xxxx-xxxx-xxxx',
            summary: 'Test advisory summary',
            description: 'Test advisory description',
            severity: 'HIGH',
            publishedAt: '2024-01-01',
            updatedAt: '2024-01-10',
            vulnerabilities: [],
            references: [],
        },
    ];

    const mockThreatIntel: ThreatIntelligence = {
        cveMatches: mockCVEs,
        advisoryMatches: mockAdvisories,
        riskScore: 50,
        riskLevel: 'HIGH',
        threatSummary: 'Test threat summary',
        recommendations: ['Fix it'],
        lastUpdated: '2024-01-01T00:00:00.000Z',
    };

    const mockPackageVuln: PackageVulnerability = {
        packageName: 'react',
        currentVersion: '18.0.0',
        vulnerabilities: mockCVEs,
        advisories: mockAdvisories,
        riskScore: 30,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -----------------------------------------------------------------------
    // getLatestThreats
    // -----------------------------------------------------------------------

    describe('getLatestThreats', () => {
        it('returns cached data when cache hit', async () => {
            const cachedData = {
                cves: mockCVEs,
                advisories: mockAdvisories,
                lastUpdated: '2024-01-01',
            };
            vi.mocked(memoryCache.getCachedThreatData).mockResolvedValueOnce(cachedData);

            const result = await getLatestThreats();

            expect(result).toEqual(cachedData);
            expect(cveFetcher.fetchReactCVEs).not.toHaveBeenCalled();
            expect(githubAdvisories.fetchReactAdvisories).not.toHaveBeenCalled();
            expect(memoryCache.setCachedThreatData).not.toHaveBeenCalled();
        });

        it('fetches fresh data on cache miss and caches result', async () => {
            vi.mocked(memoryCache.getCachedThreatData).mockResolvedValueOnce(null);
            vi.mocked(cveFetcher.fetchReactCVEs).mockResolvedValueOnce(mockCVEs);
            vi.mocked(githubAdvisories.fetchReactAdvisories).mockResolvedValueOnce(mockAdvisories);

            const result = await getLatestThreats();

            expect(result.cves).toEqual(mockCVEs);
            expect(result.advisories).toEqual(mockAdvisories);
            expect(result.lastUpdated).toBeDefined();
            expect(typeof result.lastUpdated).toBe('string');
            expect(cveFetcher.fetchReactCVEs).toHaveBeenCalledWith(30);
            expect(githubAdvisories.fetchReactAdvisories).toHaveBeenCalledWith(30);
            expect(memoryCache.setCachedThreatData).toHaveBeenCalledWith(
                'threats:latest:react',
                expect.objectContaining({
                    cves: mockCVEs,
                    advisories: mockAdvisories,
                }),
                21600,
            );
        });
    });

    // -----------------------------------------------------------------------
    // analyzeRepositoryThreats
    // -----------------------------------------------------------------------

    describe('analyzeRepositoryThreats', () => {
        it('uses hashDependencies for cache key and returns cached data on hit', async () => {
            vi.mocked(memoryCache.getCachedThreatData).mockResolvedValueOnce(mockThreatIntel);

            const result = await analyzeRepositoryThreats({ react: '18.0.0' });

            expect(result).toEqual(mockThreatIntel);
            expect(riskAnalyzer.generateThreatIntelligence).not.toHaveBeenCalled();
            // Verify cache was checked with a key containing the hash prefix
            expect(memoryCache.getCachedThreatData).toHaveBeenCalledWith(
                expect.stringMatching(/^threats:repo:[0-9a-f]{12}$/),
            );
        });

        it('fetches fresh intelligence on cache miss and caches with hash key', async () => {
            vi.mocked(memoryCache.getCachedThreatData).mockResolvedValueOnce(null);
            vi.mocked(riskAnalyzer.generateThreatIntelligence).mockResolvedValueOnce(mockThreatIntel);

            const result = await analyzeRepositoryThreats({ react: '18.0.0' });

            expect(result).toEqual(mockThreatIntel);
            expect(riskAnalyzer.generateThreatIntelligence).toHaveBeenCalledWith({ react: '18.0.0' });
            // Cache key should be 'threats:repo:' + 12-char hex hash
            expect(memoryCache.setCachedThreatData).toHaveBeenCalledWith(
                expect.stringMatching(/^threats:repo:[0-9a-f]{12}$/),
                mockThreatIntel,
                3600,
            );
        });
    });

    // -----------------------------------------------------------------------
    // getPackageVulnerabilities
    // -----------------------------------------------------------------------

    describe('getPackageVulnerabilities', () => {
        it('returns PackageVulnerability with correct metadata on cache miss', async () => {
            vi.mocked(memoryCache.getCachedThreatData).mockResolvedValueOnce(null);
            vi.mocked(riskAnalyzer.analyzePackageRisk).mockResolvedValueOnce(mockPackageVuln);

            const result = await getPackageVulnerabilities('react', '18.0.0');

            expect(result.packageName).toBe('react');
            expect(result.currentVersion).toBe('18.0.0');
            expect(result.vulnerabilities).toEqual(mockCVEs);
            expect(result.advisories).toEqual(mockAdvisories);
            expect(result.riskScore).toBe(30);
            expect(riskAnalyzer.analyzePackageRisk).toHaveBeenCalledWith('react', '18.0.0');
            expect(memoryCache.setCachedThreatData).toHaveBeenCalledWith(
                'threats:package:react:18.0.0',
                mockPackageVuln,
                43200,
            );
        });

        it('returns cached vulnerability data on cache hit', async () => {
            vi.mocked(memoryCache.getCachedThreatData).mockResolvedValueOnce(mockPackageVuln);

            const result = await getPackageVulnerabilities('react', '18.0.0');

            expect(result).toEqual(mockPackageVuln);
            expect(riskAnalyzer.analyzePackageRisk).not.toHaveBeenCalled();
        });
    });

    // -----------------------------------------------------------------------
    // prewarmThreatCache
    // -----------------------------------------------------------------------

    describe('prewarmThreatCache', () => {
        beforeEach(() => {
            vi.stubGlobal('window', undefined);
            vi.spyOn(global, 'setTimeout').mockImplementation((fn: () => void) => fn());
        });

        afterEach(() => {
            vi.unstubAllGlobals();
            vi.restoreAllMocks();
        });

        it('handles getLatestThreats error gracefully without throwing', async () => {
            // Only mock the first call (getLatestThreats) to fail;
            // prewarmThreatCache also calls getPackageVulnerabilities for 4 packages
            // so we need to provide data for those calls
            vi.mocked(memoryCache.getCachedThreatData).mockResolvedValue(null);
            vi.mocked(cveFetcher.fetchReactCVEs).mockRejectedValue(new Error('Network error'));
            vi.mocked(githubAdvisories.fetchReactAdvisories).mockRejectedValue(new Error('Network error'));
            vi.mocked(riskAnalyzer.analyzePackageRisk).mockResolvedValue(mockPackageVuln);

            await expect(prewarmThreatCache()).resolves.toBeUndefined();
            // Should have attempted to fetch threats (and failed internally)
            expect(cveFetcher.fetchReactCVEs).toHaveBeenCalled();
        });
    });
});
