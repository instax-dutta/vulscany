/**
 * Advanced Risk Analysis Engine
 * VulkanorAI-powered threat assessment and scoring
 */

import { CVEData, GitHubAdvisory, ThreatIntelligence, RiskFactors, PackageVulnerability } from './types';
import { fetchCVEsByPackage } from './cve-fetcher';
import { fetchAdvisoriesForPackage } from './github-advisories';

export async function analyzePackageRisk(
    packageName: string,
    currentVersion: string
): Promise<PackageVulnerability> {
    const [cves, advisories] = await Promise.all([
        fetchCVEsByPackage(packageName),
        fetchAdvisoriesForPackage(packageName),
    ]);

    const riskScore = calculatePackageRiskScore(cves, advisories, currentVersion);

    return {
        packageName,
        currentVersion,
        vulnerabilities: cves,
        advisories,
        riskScore,
        recommendedVersion: findSafeVersion(advisories, currentVersion),
    };
}

export async function generateThreatIntelligence(
    dependencies: Record<string, string>
): Promise<ThreatIntelligence> {
    const packageNames = Object.keys(dependencies);
    const allCVEs: CVEData[] = [];
    const allAdvisories: GitHubAdvisory[] = [];

    // Analyze each dependency
    for (const pkg of packageNames) {
        const analysis = await analyzePackageRisk(pkg, dependencies[pkg]);
        allCVEs.push(...analysis.vulnerabilities);
        allAdvisories.push(...analysis.advisories);
    }

    // Calculate overall risk
    const riskFactors = calculateRiskFactors(allCVEs, allAdvisories, dependencies);
    const riskScore = calculateOverallRiskScore(riskFactors);
    const riskLevel = getRiskLevel(riskScore);

    return {
        cveMatches: allCVEs,
        advisoryMatches: allAdvisories,
        riskScore,
        riskLevel,
        threatSummary: generateThreatSummary(riskFactors, allCVEs, allAdvisories),
        recommendations: generateRecommendations(riskFactors, allCVEs, allAdvisories),
        lastUpdated: new Date().toISOString(),
    };
}

function calculatePackageRiskScore(
    cves: CVEData[],
    advisories: GitHubAdvisory[],
    currentVersion: string
): number {
    let score = 0;

    // CVE-based scoring
    for (const cve of cves) {
        switch (cve.severity) {
            case 'CRITICAL':
                score += 25;
                break;
            case 'HIGH':
                score += 15;
                break;
            case 'MEDIUM':
                score += 8;
                break;
            case 'LOW':
                score += 3;
                break;
        }

        // Bonus for exploits
        if (cve.exploitAvailable) {
            score += 10;
        }
    }

    // Advisory-based scoring
    for (const advisory of advisories) {
        if (isVersionAffected(currentVersion, advisory)) {
            switch (advisory.severity) {
                case 'CRITICAL':
                    score += 20;
                    break;
                case 'HIGH':
                    score += 12;
                    break;
                case 'MODERATE':
                    score += 6;
                    break;
                case 'LOW':
                    score += 2;
                    break;
            }
        }
    }

    return Math.min(score, 100);
}

function calculateRiskFactors(
    cves: CVEData[],
    advisories: GitHubAdvisory[],
    dependencies: Record<string, string>
): RiskFactors {
    return {
        dependencyAge: 0, // Would need package metadata
        knownExploits: cves.filter(c => c.exploitAvailable).length,
        criticalCVEs: cves.filter(c => c.severity === 'CRITICAL').length,
        highCVEs: cves.filter(c => c.severity === 'HIGH').length,
        outdatedDependencies: 0, // Would need latest version check
        transitiveVulnerabilities: Math.floor(cves.length * 0.3), // Estimate
    };
}

function calculateOverallRiskScore(factors: RiskFactors): number {
    let score = 0;

    score += factors.criticalCVEs * 20;
    score += factors.highCVEs * 10;
    score += factors.knownExploits * 15;
    score += factors.transitiveVulnerabilities * 5;

    return Math.min(score, 100);
}

function getRiskLevel(score: number): ThreatIntelligence['riskLevel'] {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
}

function generateThreatSummary(
    factors: RiskFactors,
    cves: CVEData[],
    advisories: GitHubAdvisory[]
): string {
    const parts: string[] = [];

    if (factors.criticalCVEs > 0) {
        parts.push(`${factors.criticalCVEs} critical vulnerabilities detected`);
    }

    if (factors.knownExploits > 0) {
        parts.push(`${factors.knownExploits} known exploits in the wild`);
    }

    if (cves.length > 0) {
        parts.push(`${cves.length} CVEs identified`);
    }

    if (advisories.length > 0) {
        parts.push(`${advisories.length} security advisories`);
    }

    return parts.length > 0
        ? parts.join(', ')
        : 'No significant threats detected';
}

function generateRecommendations(
    factors: RiskFactors,
    cves: CVEData[],
    advisories: GitHubAdvisory[]
): string[] {
    const recommendations: string[] = [];

    if (factors.criticalCVEs > 0) {
        recommendations.push('🚨 Immediate action required: Update dependencies with critical vulnerabilities');
    }

    if (factors.knownExploits > 0) {
        recommendations.push('⚠️ Active exploits detected: Prioritize patching these vulnerabilities');
    }

    if (advisories.length > 5) {
        recommendations.push('📦 Review and update all flagged packages to their latest secure versions');
    }

    if (factors.transitiveVulnerabilities > 0) {
        recommendations.push('🔍 Audit dependency tree for transitive vulnerabilities');
    }

    if (recommendations.length === 0) {
        recommendations.push('✅ Continue monitoring for new threats');
        recommendations.push('🔄 Keep dependencies up to date');
    }

    return recommendations;
}

function isVersionAffected(currentVersion: string, advisory: GitHubAdvisory): boolean {
    // Simplified version checking - would need semver library for production
    for (const vuln of advisory.vulnerabilities) {
        if (vuln.vulnerableVersionRange === '*') {
            return true;
        }
        // Basic check - in production, use semver.satisfies()
        if (vuln.vulnerableVersionRange.includes(currentVersion)) {
            return true;
        }
    }
    return false;
}

function findSafeVersion(advisories: GitHubAdvisory[], currentVersion: string): string | undefined {
    for (const advisory of advisories) {
        for (const vuln of advisory.vulnerabilities) {
            if (vuln.firstPatchedVersion) {
                return vuln.firstPatchedVersion;
            }
        }
    }
    return undefined;
}
