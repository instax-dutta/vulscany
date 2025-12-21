/**
 * Threat Intelligence Orchestrator
 * Main entry point for threat intelligence features
 */

import { fetchReactCVEs } from './cve-fetcher';
import { fetchReactAdvisories } from './github-advisories';
import { generateThreatIntelligence, analyzePackageRisk } from './risk-analyzer';
import { getCachedThreatData, setCachedThreatData } from './redis-cache';
import type { ThreatIntelligence, CVEData, GitHubAdvisory, PackageVulnerability } from './types';

/**
 * Get latest React ecosystem threats
 * Cached for performance
 */
export async function getLatestThreats(): Promise<{
    cves: CVEData[];
    advisories: GitHubAdvisory[];
    lastUpdated: string;
}> {
    const cacheKey = 'threats:latest:react';
    const cached = await getCachedThreatData(cacheKey);

    if (cached) {
        return cached;
    }

    const [cves, advisories] = await Promise.all([
        fetchReactCVEs(30),
        fetchReactAdvisories(30),
    ]);

    const result = {
        cves,
        advisories,
        lastUpdated: new Date().toISOString(),
    };

    // Cache for 6 hours
    await setCachedThreatData(cacheKey, result, 21600);

    return result;
}

/**
 * Analyze repository dependencies for threats
 */
export async function analyzeRepositoryThreats(
    dependencies: Record<string, string>
): Promise<ThreatIntelligence> {
    const cacheKey = `threats:repo:${hashDependencies(dependencies)}`;
    const cached = await getCachedThreatData(cacheKey);

    if (cached) {
        return cached;
    }

    const intelligence = await generateThreatIntelligence(dependencies);

    // Cache for 1 hour (dependencies change frequently)
    await setCachedThreatData(cacheKey, intelligence, 3600);

    return intelligence;
}

/**
 * Get vulnerability details for specific package
 */
export async function getPackageVulnerabilities(
    packageName: string,
    version: string
): Promise<PackageVulnerability> {
    const cacheKey = `threats:package:${packageName}:${version}`;
    const cached = await getCachedThreatData(cacheKey);

    if (cached) {
        return cached;
    }

    const analysis = await analyzePackageRisk(packageName, version);

    // Cache for 12 hours
    await setCachedThreatData(cacheKey, analysis, 43200);

    return analysis;
}

/**
 * Pre-warm cache with common React packages and latest threat data
 */
export async function prewarmThreatCache(): Promise<void> {
    if (typeof window !== 'undefined') return; // Server-side only

    console.log('[ThreatIntel] Pre-warming cache...');

    const commonPackages = [
        { name: 'react', version: '18.0.0' },
        { name: 'react-dom', version: '18.0.0' },
        { name: 'next', version: '14.0.0' },
        { name: 'react-router-dom', version: '6.0.0' },
    ];

    // Fetch latest threats
    await getLatestThreats().catch(err =>
        console.error('[ThreatIntel] Failed to fetch latest threats:', err)
    );

    // Pre-cache common packages
    for (const pkg of commonPackages) {
        await getPackageVulnerabilities(pkg.name, pkg.version).catch(err =>
            console.error(`[ThreatIntel] Failed to cache ${pkg.name}:`, err)
        );

        // Delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('[ThreatIntel] Cache pre-warming complete');
}

function hashDependencies(deps: Record<string, string>): string {
    const sorted = Object.keys(deps).sort().map(k => `${k}@${deps[k]}`).join(',');
    // Simple hash for cache key
    let hash = 0;
    for (let i = 0; i < sorted.length; i++) {
        const char = sorted.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}
