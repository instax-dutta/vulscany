import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  calculatePackageRiskScore,
  calculateRiskFactors,
  calculateOverallRiskScore,
  getRiskLevel,
  generateThreatSummary,
  generateRecommendations,
  isVersionAffected,
  findSafeVersion,
  analyzePackageRisk,
  generateThreatIntelligence,
} from './risk-analyzer';

vi.mock('./cve-fetcher', () => ({
  fetchCVEsByPackage: vi.fn(),
}));

vi.mock('./github-advisories', () => ({
  fetchAdvisoriesForPackage: vi.fn(),
}));

vi.mock('./memory-cache', () => ({
  getCachedThreatData: vi.fn().mockResolvedValue(null),
  setCachedThreatData: vi.fn().mockResolvedValue(undefined),
}));

import * as cveFetcher from './cve-fetcher';
import * as githubAdvisories from './github-advisories';

const mockCriticalCVE = {
  id: 'CVE-2024-0001',
  description: 'Critical vuln',
  severity: 'CRITICAL',
  cvssScore: 9.0,
  publishedDate: '2024-01-01',
  lastModifiedDate: '2024-06-01',
  affectedPackages: ['react'],
  references: [],
  exploitAvailable: true,
};

const mockHighCVE = {
  id: 'CVE-2024-0002',
  description: 'High vuln',
  severity: 'HIGH',
  cvssScore: 7.5,
  publishedDate: '2024-01-01',
  lastModifiedDate: '2024-06-01',
  affectedPackages: ['react'],
  references: [],
  exploitAvailable: false,
};

const mockMediumCVE = {
  id: 'CVE-2024-0003',
  description: 'Medium vuln',
  severity: 'MEDIUM',
  cvssScore: 5.0,
  publishedDate: '2024-01-01',
  lastModifiedDate: '2024-06-01',
  affectedPackages: ['react'],
  references: [],
};

const mockLowCVE = {
  id: 'CVE-2024-0004',
  description: 'Low vuln',
  severity: 'LOW',
  cvssScore: 2.5,
  publishedDate: '2024-01-01',
  lastModifiedDate: '2024-06-01',
  affectedPackages: ['react'],
  references: [],
  exploitAvailable: false,
};

const mockCriticalAdvisory = {
  id: 'GHSA-crit',
  summary: 'Critical advisory',
  description: 'A critical advisory',
  severity: 'CRITICAL',
  publishedAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
  vulnerabilities: [
    {
      package: { name: 'react', ecosystem: 'npm' },
      vulnerableVersionRange: '>=16.0.0 <18.2.0',
      firstPatchedVersion: '18.2.0',
    },
  ],
  references: [{ url: 'https://github.com/advisories/GHSA-crit' }],
};

const mockHighAdvisory = {
  id: 'GHSA-high',
  summary: 'High advisory',
  description: 'A high advisory',
  severity: 'HIGH',
  publishedAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
  vulnerabilities: [
    {
      package: { name: 'react', ecosystem: 'npm' },
      vulnerableVersionRange: '>=17.0.0 <18.3.0',
      firstPatchedVersion: '18.3.0',
    },
  ],
  references: [{ url: 'https://github.com/advisories/GHSA-high' }],
};

describe('risk-analyzer – internal functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculatePackageRiskScore', () => {
    it('returns 0 with no CVEs or advisories', () => {
      const score = calculatePackageRiskScore([], [], '18.0.0');
      expect(score).toBe(0);
    });

    it('adds 25pts for CRITICAL CVE + 10 bonus for exploit = 35', () => {
      const score = calculatePackageRiskScore([mockCriticalCVE], [], '18.0.0');
      expect(score).toBe(35);
    });

    it('adds 15pts for HIGH CVE without exploit', () => {
      const score = calculatePackageRiskScore([mockHighCVE], [], '18.0.0');
      expect(score).toBe(15);
    });

    it('adds 8pts for MEDIUM CVE', () => {
      const score = calculatePackageRiskScore([mockMediumCVE], [], '18.0.0');
      expect(score).toBe(8);
    });

    it('adds 3pts for LOW CVE', () => {
      const score = calculatePackageRiskScore([mockLowCVE], [], '18.0.0');
      expect(score).toBe(3);
    });

    it('adds 20pts for CRITICAL advisory when version range contains version string', () => {
      const score = calculatePackageRiskScore([], [mockCriticalAdvisory], '16.0.0');
      expect(score).toBe(20);
    });

    it('returns 0 for advisory when version is outside the affected range string', () => {
      const score = calculatePackageRiskScore([], [mockCriticalAdvisory], '19.0.0');
      expect(score).toBe(0);
    });

    it('caps total score at 100', () => {
      const cves = [
        mockCriticalCVE,
        mockCriticalCVE,
        mockCriticalCVE,
        mockCriticalCVE,
      ];
      const advisories = [mockCriticalAdvisory, mockHighAdvisory];
      const score = calculatePackageRiskScore(cves, advisories, '17.0.0');
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateRiskFactors', () => {
    it('counts criticalCVEs and highCVEs correctly', () => {
      const factors = calculateRiskFactors(
        [mockCriticalCVE, mockHighCVE],
        [mockHighAdvisory, mockCriticalAdvisory],
        { react: '18.0.0' }
      );
      expect(factors.criticalCVEs).toBe(2);
      expect(factors.highCVEs).toBe(2);
      expect(factors.knownExploits).toBe(1);
    });

    it('sets outdatedDependencies to advisories.length', () => {
      const factors = calculateRiskFactors(
        [],
        [mockHighAdvisory, mockCriticalAdvisory],
        { react: '18.0.0' }
      );
      expect(factors.outdatedDependencies).toBe(2);
    });

    it('computes transitiveVulnerabilities when input has items', () => {
      const factors = calculateRiskFactors(
        [mockCriticalCVE, mockHighCVE, mockMediumCVE],
        [mockCriticalAdvisory, mockHighAdvisory],
        { react: '18.0.0' }
      );
      expect(factors.transitiveVulnerabilities).toBeGreaterThan(0);
      expect(factors.dependencyAge).toBe(0);
    });
  });

  describe('calculateOverallRiskScore', () => {
    it('1 critical CVE + 1 exploit = 60 before advisory additions', () => {
      const factors = {
        dependencyAge: 0,
        knownExploits: 1,
        criticalCVEs: 1,
        highCVEs: 0,
        outdatedDependencies: 0,
        transitiveVulnerabilities: 0,
      };
      const score = calculateOverallRiskScore(factors);
      expect(score).toBe(60);
    });

    it('high CVEs add 20 each', () => {
      const factors = {
        dependencyAge: 0,
        knownExploits: 0,
        criticalCVEs: 0,
        highCVEs: 2,
        outdatedDependencies: 0,
        transitiveVulnerabilities: 0,
      };
      const score = calculateOverallRiskScore(factors);
      expect(score).toBe(40);
    });

    it('caps advisory contribution at 40', () => {
      const factors = {
        dependencyAge: 0,
        knownExploits: 0,
        criticalCVEs: 0,
        highCVEs: 0,
        outdatedDependencies: 25,
        transitiveVulnerabilities: 0,
      };
      const score = calculateOverallRiskScore(factors);
      expect(score).toBeLessThanOrEqual(40);
    });

    it('caps transitiveVulns contribution at 15', () => {
      const factors = {
        dependencyAge: 0,
        knownExploits: 0,
        criticalCVEs: 0,
        highCVEs: 0,
        outdatedDependencies: 0,
        transitiveVulnerabilities: 10,
      };
      const score = calculateOverallRiskScore(factors);
      expect(score).toBeLessThanOrEqual(15);
    });
  });

  describe('getRiskLevel', () => {
    it('0 -> LOW', () => expect(getRiskLevel(0)).toBe('LOW'));
    it('25 -> MEDIUM', () => expect(getRiskLevel(25)).toBe('MEDIUM'));
    it('50 -> HIGH', () => expect(getRiskLevel(50)).toBe('HIGH'));
    it('75 -> CRITICAL', () => expect(getRiskLevel(75)).toBe('CRITICAL'));
    it('74 -> HIGH (boundary)', () => expect(getRiskLevel(74)).toBe('HIGH'));
  });

  describe('generateThreatSummary', () => {
    it('includes count text when criticalCVEs > 0', () => {
      const summary = generateThreatSummary(
        { criticalCVEs: 2, knownExploits: 0, highCVEs: 0, dependencyAge: 0, outdatedDependencies: 0, transitiveVulnerabilities: 0 },
        [mockCriticalCVE],
        []
      );
      expect(summary).toContain('2 critical vulnerabilities detected');
    });

    it('returns "No significant threats detected" when no data', () => {
      const summary = generateThreatSummary(
        { criticalCVEs: 0, knownExploits: 0, highCVEs: 0, dependencyAge: 0, outdatedDependencies: 0, transitiveVulnerabilities: 0 },
        [],
        []
      );
      expect(summary).toBe('No significant threats detected');
    });

    it('includes CVE and advisory counts', () => {
      const summary = generateThreatSummary(
        { criticalCVEs: 0, knownExploits: 0, highCVEs: 0, dependencyAge: 0, outdatedDependencies: 0, transitiveVulnerabilities: 0 },
        [mockCriticalCVE],
        [mockHighAdvisory]
      );
      expect(summary).toContain('1 CVEs identified');
      expect(summary).toContain('1 security advisories');
    });
  });

  describe('generateRecommendations', () => {
    it('includes "Immediate action required" when criticalCVEs > 0', () => {
      const recs = generateRecommendations(
        { criticalCVEs: 1, knownExploits: 0, highCVEs: 0, dependencyAge: 0, outdatedDependencies: 0, transitiveVulnerabilities: 0 },
        [],
        []
      );
      expect(recs.some((r: string) => r.includes('Immediate action required'))).toBe(true);
    });

    it('returns monitoring messages when no data', () => {
      const recs = generateRecommendations(
        { criticalCVEs: 0, knownExploits: 0, highCVEs: 0, dependencyAge: 0, outdatedDependencies: 0, transitiveVulnerabilities: 0 },
        [],
        []
      );
      expect(recs).toEqual(
        expect.arrayContaining([
          expect.stringContaining('monitoring'),
          expect.stringContaining('up to date'),
        ])
      );
    });
  });

  describe('isVersionAffected', () => {
    it('wildcard * always returns true', () => {
      expect(
        isVersionAffected('18.0.0', {
          vulnerabilities: [{ vulnerableVersionRange: '*' }],
        })
      ).toBe(true);
    });

    it('range containing version string returns true', () => {
      expect(
        isVersionAffected('16.0.0', {
          vulnerabilities: [{ vulnerableVersionRange: '>=16.0.0 <18.2.0' }],
        })
      ).toBe(true);
    });

    it('no matching range string returns false', () => {
      expect(
        isVersionAffected('20.0.0', {
          vulnerabilities: [{ vulnerableVersionRange: '>=16.0.0 <18.2.0' }],
        })
      ).toBe(false);
    });

    it('no matching range returns false', () => {
      expect(
        isVersionAffected('20.0.0', {
          vulnerabilities: [{ vulnerableVersionRange: '>=16.0.0 <18.2.0' }],
        })
      ).toBe(false);
    });
  });

  describe('findSafeVersion', () => {
    it('returns firstPatchedVersion from first advisory with one', () => {
      expect(findSafeVersion([mockCriticalAdvisory], '17.0.0')).toBe('18.2.0');
    });

    it('returns undefined when no advisories have firstPatchedVersion', () => {
      expect(
        findSafeVersion(
          [
            {
              ...mockCriticalAdvisory,
              vulnerabilities: [{ vulnerableVersionRange: '*' }],
            },
          ],
          '17.0.0'
        )
      ).toBeUndefined();
    });
  });
});

describe('risk-analyzer – exported functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('analyzePackageRisk returns PackageVulnerability with correct shape', async () => {
    cveFetcher.fetchCVEsByPackage.mockResolvedValue([mockCriticalCVE]);
    githubAdvisories.fetchAdvisoriesForPackage.mockResolvedValue([]);

    const result = await analyzePackageRisk('react', '18.0.0');
    expect(result.packageName).toBe('react');
    expect(result.currentVersion).toBe('18.0.0');
    expect(result.vulnerabilities).toEqual([mockCriticalCVE]);
    expect(result.advisories).toEqual([]);
    expect(result.riskScore).toBeGreaterThan(0);
  });

  it('generateThreatIntelligence aggregates across dependencies', async () => {
    cveFetcher.fetchCVEsByPackage.mockImplementation(async (pkg: string) => {
      if (pkg === 'react') return [mockCriticalCVE];
      return [];
    });
    githubAdvisories.fetchAdvisoriesForPackage.mockResolvedValue([]);

    const result = await generateThreatIntelligence({
      react: '18.0.0',
      next: '14.0.0',
    });

    expect(result.cveMatches).toEqual([mockCriticalCVE]);
    expect(result.riskScore).toBeGreaterThan(0);
    expect(result.riskLevel).toBeDefined();
    expect(result.threatSummary).toBeDefined();
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  it('generateThreatIntelligence returns LOW/empty for empty dependencies', async () => {
    cveFetcher.fetchCVEsByPackage.mockResolvedValue([]);
    githubAdvisories.fetchAdvisoriesForPackage.mockResolvedValue([]);

    const result = await generateThreatIntelligence({});

    expect(result.cveMatches).toEqual([]);
    expect(result.advisoryMatches).toEqual([]);
    expect(result.riskScore).toBe(0);
    expect(result.riskLevel).toBe('LOW');
    expect(new Date(result.lastUpdated).toISOString()).toBe(result.lastUpdated);
  });
});
