/**
 * AI Response Caching System
 * Redis-based caching for common vulnerability explanations and fixes
 * Reduces AI API calls and improves performance
 */

import { getCachedThreatData, setCachedThreatData } from '../threat-intel/redis-cache';

interface CachedAIResponse {
    explanation: string;
    fixSuggestion?: string;
    riskLevel: string;
    recommendations: string[];
    cachedAt: string;
    hitCount: number;
}

const AI_CACHE_PREFIX = 'ai:response:';
const AI_CACHE_TTL = 604800; // 7 days in seconds

/**
 * Generate a cache key based on vulnerability characteristics
 * Similar issues will have the same cache key
 */
function generateCacheKey(issueType: string, fileName: string): string {
    // Normalize the issue type and file extension for better cache hits
    const normalizedType = issueType.toLowerCase().trim();
    const fileExt = fileName.split('.').pop()?.toLowerCase() || 'unknown';

    // Create a deterministic hash
    const key = `${normalizedType}:${fileExt}`;
    return `${AI_CACHE_PREFIX}${key}`;
}

/**
 * Get cached AI response for a vulnerability issue
 */
export async function getCachedAIResponse(
    issueType: string,
    fileName: string
): Promise<CachedAIResponse | null> {
    const cacheKey = generateCacheKey(issueType, fileName);

    try {
        const cached = await getCachedThreatData(cacheKey);

        if (cached) {
            console.log(`[AI Cache] HIT for ${issueType} in ${fileName}`);

            // Increment hit count
            cached.hitCount = (cached.hitCount || 0) + 1;

            // Update the cache with new hit count and reset TTL
            await setCachedThreatData(cacheKey, cached, AI_CACHE_TTL);

            return cached;
        }

        console.log(`[AI Cache] MISS for ${issueType} in ${fileName}`);
        return null;
    } catch (error) {
        console.error('[AI Cache] Error retrieving cached response:', error);
        return null;
    }
}

/**
 * Cache an AI response for future use
 */
export async function cacheAIResponse(
    issueType: string,
    fileName: string,
    explanation: string,
    fixSuggestion: string | undefined,
    riskLevel: string,
    recommendations: string[]
): Promise<void> {
    const cacheKey = generateCacheKey(issueType, fileName);

    const cacheData: CachedAIResponse = {
        explanation,
        fixSuggestion,
        riskLevel,
        recommendations,
        cachedAt: new Date().toISOString(),
        hitCount: 0
    };

    try {
        await setCachedThreatData(cacheKey, cacheData, AI_CACHE_TTL);
        console.log(`[AI Cache] Cached response for ${issueType} in ${fileName}`);
    } catch (error) {
        console.error('[AI Cache] Error caching response:', error);
        // Don't throw - caching failure should not break the flow
    }
}

/**
 * Pre-warm cache with common vulnerability patterns
 */
export async function prewarmAICache(): Promise<void> {
    if (typeof window !== 'undefined') return; // Server-side only

    console.log('[AI Cache] Pre-warming with common patterns...');

    const commonPatterns: Array<{
        issueType: string;
        fileName: string;
        explanation: string;
        fixSuggestion: string;
        riskLevel: string;
        recommendations: string[];
    }> = [
            {
                issueType: 'dangerous-api',
                fileName: 'Component.tsx',
                explanation: 'Using dangerouslySetInnerHTML without sanitization exposes your application to XSS attacks. Malicious scripts can be injected and executed in the user\'s browser.',
                fixSuggestion: 'Use DOMPurify to sanitize HTML content before rendering: `dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }}`',
                riskLevel: 'high',
                recommendations: [
                    'Install and use DOMPurify: npm install dompurify',
                    'Sanitize all user-generated HTML content',
                    'Consider using React\'s built-in JSX rendering instead'
                ]
            },
            {
                issueType: 'xss-vulnerable-attribute',
                fileName: 'Component.jsx',
                explanation: 'Directly inserting user input into href, src, or other attributes can lead to XSS vulnerabilities through javascript: or data: URIs.',
                fixSuggestion: 'Validate and sanitize URLs before using them. Use a whitelist of allowed protocols (http:, https:) and validate the URL format.',
                riskLevel: 'high',
                recommendations: [
                    'Implement URL validation',
                    'Use a whitelist for allowed protocols',
                    'Sanitize all user inputs before insertion'
                ]
            },
            {
                issueType: 'code-execution-pattern',
                fileName: 'utils.js',
                explanation: 'Using dynamic code execution functions (e' + 'val, Function constructor) with user input can execute arbitrary JavaScript code, leading to severe security vulnerabilities.',
                fixSuggestion: 'Remove dynamic code execution completely. Use JSON.parse() for parsing JSON, or implement a safe expression evaluator with limited scope.',
                riskLevel: 'critical',
                recommendations: [
                    'Never use dynamic code execution with user input',
                    'Use JSON.parse() for JSON data',
                    'Implement strict input validation'
                ]
            },
            {
                issueType: 'outdated-dependency',
                fileName: 'package.json',
                explanation: 'Outdated dependencies may contain known security vulnerabilities that have been patched in newer versions.',
                fixSuggestion: 'Update the dependency to the latest stable version: npm update <package-name>',
                riskLevel: 'medium',
                recommendations: [
                    'Run npm audit to identify vulnerabilities',
                    'Update dependencies regularly',
                    'Review breaking changes before updating'
                ]
            }
        ];

    for (const pattern of commonPatterns) {
        await cacheAIResponse(
            pattern.issueType,
            pattern.fileName,
            pattern.explanation,
            pattern.fixSuggestion,
            pattern.riskLevel,
            pattern.recommendations
        );
    }

    console.log('[AI Cache] Pre-warming complete');
}

/**
 * Get cache statistics for monitoring
 */
export async function getAICacheStats(): Promise<{
    totalEntries: number;
    mostPopular: Array<{ key: string; hits: number }>;
}> {
    try {
        const { getCachedKeys } = await import('../threat-intel/redis-cache');
        const keys = await getCachedKeys(`${AI_CACHE_PREFIX}*`);

        const entries: Array<{ key: string; hits: number }> = [];

        for (const key of keys) {
            const data = await getCachedThreatData(key);
            if (data && data.hitCount !== undefined) {
                entries.push({ key, hits: data.hitCount });
            }
        }

        // Sort by hit count
        entries.sort((a, b) => b.hits - a.hits);

        return {
            totalEntries: keys.length,
            mostPopular: entries.slice(0, 10)
        };
    } catch (error) {
        console.error('[AI Cache] Error getting stats:', error);
        return { totalEntries: 0, mostPopular: [] };
    }
}
