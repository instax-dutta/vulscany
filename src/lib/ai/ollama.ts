/**
 * Ollama Cloud AI Integration
 * Primary AI provider for vulnerability analysis and explanation
 */

import { createKeyRotator, type APIKeyRotator } from './rotation';
import { searchCache, hashQuery, CACHED_SEARCH_QUERIES } from '@/lib/cache';

let ollamaRotator: APIKeyRotator | null = null;

function getOllamaRotator(): APIKeyRotator {
    if (!ollamaRotator) {
        const keys = process.env.OLLAMA_API_KEYS;
        if (!keys) {
            throw new Error('OLLAMA_API_KEYS not configured');
        }
        ollamaRotator = createKeyRotator(keys);
    }
    return ollamaRotator;
}

export interface OllamaSearchResult {
    query: string;
    results: Array<{
        title: string;
        content: string;
        source?: string;
    }>;
}

export interface VulnerabilityExplanation {
    summary: string;
    technicalDetails: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
}

/**
 * Perform cached search using Ollama Cloud Search
 */
export async function searchVulnerabilityKnowledge(query: string): Promise<OllamaSearchResult | null> {
    const cacheKey = hashQuery(query);

    // Check cache first
    const cached = searchCache.get(cacheKey);
    if (cached) {
        console.log(`[Ollama Search] Cache hit for query: ${query}`);
        return cached as OllamaSearchResult;
    }

    const rotator = getOllamaRotator();
    const apiKey = rotator.getNextKey();

    if (!apiKey) {
        console.error('[Ollama Search] No available API keys');
        return null;
    }

    try {
        const response = await fetch('https://ollama.com/api/web_search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({ query }),
            signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
            throw new Error(`Ollama Search API error: ${response.status}`);
        }

        const data = await response.json();
        const result: OllamaSearchResult = {
            query,
            results: data.results || []
        };

        // Cache the successful result
        searchCache.set(cacheKey, result);

        console.log(`[Ollama Search] Success for query: ${query}`);
        return result;

    } catch (error: any) {
        console.error(`[Ollama Search] Failed:`, error.message);
        return null;
    }
}

/**
 * Generate vulnerability explanation using Ollama Cloud
 */
export async function explainVulnerability(
    fileName: string,
    codeSnippet: string,
    issueType: string
): Promise<VulnerabilityExplanation | null> {
    const rotator = getOllamaRotator();
    const apiKey = rotator.getNextKey();

    if (!apiKey) {
        console.error('[Ollama] No available API keys');
        return null;
    }

    const prompt = `Analyze this security issue in ${fileName}:

**Issue:** ${issueType}
**Code:**
\`\`\`
${codeSnippet.substring(0, 400)}
\`\`\`

Provide a concise explanation (max 150 words):
1. What's vulnerable & why
2. Potential impact
3. Quick fix steps

Be direct and actionable.`;

    try {
        const response = await fetch('https://ollama.com/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-oss:120b-cloud',
                messages: [
                    { role: 'system', content: 'You are a concise security expert. Provide brief, actionable explanations without fluff.' },
                    { role: 'user', content: prompt }
                ],
                stream: false,
                options: {
                    temperature: 0.5,
                    num_predict: 400
                }
            }),
            signal: AbortSignal.timeout(30000)
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.message?.content || '';

        // Parse the response (simple parsing)
        const lines = content.split('\n').filter((l: string) => l.trim());

        return {
            summary: lines.slice(0, 2).join(' '),
            technicalDetails: content,
            riskLevel: issueType.toLowerCase().includes('critical') ? 'critical' :
                issueType.toLowerCase().includes('high') ? 'high' : 'medium',
            recommendations: extractRecommendations(content)
        };

    } catch (error: any) {
        rotator.markKeyFailed(apiKey, error.message);
        console.error(`[Ollama] Failed:`, error.message);
        // Fallback or return null
        return null;
    }
}

/**
 * Generate fix suggestion using Ollama
 */
export async function generateFixSuggestion(
    fileName: string,
    vulnerableCode: string,
    explanation: string
): Promise<string | null> {
    const rotator = getOllamaRotator();
    const apiKey = rotator.getNextKey();

    if (!apiKey) {
        return null;
    }

    const prompt = `Generate a safe fix for this security issue.

File: ${fileName}
Vulnerable code:
\`\`\`
${vulnerableCode.substring(0, 300)}
\`\`\`

Issue: ${explanation.substring(0, 200)}

Provide ONLY the fixed code as a diff. No explanation.`;

    try {
        const response = await fetch('https://ollama.com/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-oss:120b-cloud',
                messages: [{ role: 'user', content: prompt }],
                stream: false,
                options: {
                    temperature: 0.3,
                    num_predict: 500
                }
            }),
            signal: AbortSignal.timeout(20000)
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status}`);
        }

        const data = await response.json();
        return data.message?.content || null;

    } catch (error: any) {
        rotator.markKeyFailed(apiKey, error.message);
        return null;
    }
}

function extractRecommendations(content: string): string[] {
    const recommendations: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^[\d-•*]/)) {
            recommendations.push(trimmed.replace(/^[\d-•*]\s*/, ''));
        }
    }

    return recommendations.length > 0 ? recommendations : ['Review the code carefully', 'Test after making changes'];
}

// Pre-cache common searches on server startup
export async function preCacheVulnerabilityKnowledge() {
    if (typeof window !== 'undefined') return; // Server-side only

    console.log('[Ollama] Pre-caching vulnerability knowledge...');

    for (const [key, query] of Object.entries(CACHED_SEARCH_QUERIES)) {
        const cacheKey = hashQuery(query);
        if (!searchCache.has(cacheKey)) {
            await searchVulnerabilityKnowledge(query);
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log('[Ollama] Pre-caching complete');
}
