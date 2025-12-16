/**
 * Threat Intelligence Types
 * Comprehensive type definitions for CVE data and risk analysis
 */

export interface CVEData {
    id: string; // CVE-2024-12345
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    cvssScore: number;
    cvssVector?: string;
    publishedDate: string;
    lastModifiedDate: string;
    affectedPackages: string[];
    references: string[];
    cweIds?: string[];
    exploitAvailable?: boolean;
    patchAvailable?: boolean;
}

export interface GitHubAdvisory {
    id: string; // GHSA-xxxx-xxxx-xxxx
    summary: string;
    description: string;
    severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    publishedAt: string;
    updatedAt: string;
    withdrawnAt?: string;
    vulnerabilities: {
        package: {
            name: string;
            ecosystem: string;
        };
        vulnerableVersionRange: string;
        firstPatchedVersion?: string;
    }[];
    references: {
        url: string;
    }[];
    cvss?: {
        score: number;
        vectorString: string;
    };
}

export interface ThreatIntelligence {
    cveMatches: CVEData[];
    advisoryMatches: GitHubAdvisory[];
    riskScore: number; // 0-100
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    threatSummary: string;
    recommendations: string[];
    lastUpdated: string;
}

export interface RiskFactors {
    dependencyAge: number; // days since last update
    knownExploits: number;
    criticalCVEs: number;
    highCVEs: number;
    outdatedDependencies: number;
    transitiveVulnerabilities: number;
}

export interface PackageVulnerability {
    packageName: string;
    currentVersion: string;
    vulnerabilities: CVEData[];
    advisories: GitHubAdvisory[];
    riskScore: number;
    recommendedVersion?: string;
}
