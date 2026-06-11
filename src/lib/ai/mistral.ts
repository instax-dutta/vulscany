/**
 * Mistral Cloud AI Integration
 * Fallback AI provider for vulnerability analysis
 */

import { createKeyRotator, type APIKeyRotator } from './rotation';

let mistralRotator: APIKeyRotator | null = null;

function getMistralRotator(): APIKeyRotator {
    if (!mistralRotator) {
        const keys = process.env.MISTRAL_API_KEYS;
        if (!keys) {
            throw new Error('MISTRAL_API_KEYS not configured');
        }
        mistralRotator = createKeyRotator(keys);
    }
    return mistralRotator;
}

export interface VulnerabilityExplanation {
    summary: string;
    technicalDetails: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
}

/**
 * Generate vulnerability explanation using Mistral (Fallback)
 * Now with Redis caching for common issues
 */
export async function explainVulnerability(
    fileName: string,
    codeSnippet: string,
    issueType: string
): Promise<VulnerabilityExplanation | null> {
    // Check cache first
    const { getCachedAIResponse, cacheAIResponse } = await import('./response-cache');
    const cached = await getCachedAIResponse(issueType, fileName);

    if (cached) {
        console.log('[Mistral] Using cached AI response');
        return {
            summary: cached.explanation.split('\n')[0] || 'Security issue detected',
            technicalDetails: cached.explanation,
            riskLevel: cached.riskLevel as 'low' | 'medium' | 'high' | 'critical',
            recommendations: cached.recommendations
        };
    }

    const rotator = getMistralRotator();
    const apiKey = rotator.getNextKey();

    if (!apiKey) {
        console.error('[Mistral] No available API keys');
        return null;
    }

    const prompt = `Analyze security issue in ${fileName}:

**Issue:** ${issueType}
**Code:**
\`\`\`
${codeSnippet.substring(0, 400)}
\`\`\`

Provide concise explanation (max 150 words):
1. Vulnerability & cause
2. Impact
3. Fix steps

Be direct and actionable.`;

    try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'mistral-small-latest',
                messages: [
                    { role: 'system', content: 'You are a concise security expert. Provide brief, actionable explanations.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.5,
                max_tokens: 400
            }),
            signal: AbortSignal.timeout(30000)
        });

        if (!response.ok) {
            throw new Error(`Mistral API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        const riskLevel = determineRiskLevel(issueType);
        const recommendations = extractRecommendations(content);

        const result = {
            summary: content.split('\n')[0] || 'Security issue detected',
            technicalDetails: content,
            riskLevel,
            recommendations
        };

        // Cache the response for future use
        await cacheAIResponse(
            issueType,
            fileName,
            content,
            undefined,
            riskLevel,
            recommendations
        );

        return result;

    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        rotator.markKeyFailed(apiKey, errMsg);
        console.error(`[Mistral] Failed:`, errMsg);
        return null;
    }
}

/**
 * Generate fix suggestion using Mistral
 */
export async function generateFixSuggestion(
    fileName: string,
    vulnerableCode: string,
    explanation: string
): Promise<string | null> {
    const rotator = getMistralRotator();
    const apiKey = rotator.getNextKey();

    if (!apiKey) {
        return null;
    }

    const prompt = `Provide a secure fix for this code issue.

File: ${fileName}
Vulnerable code:
\`\`\`
${vulnerableCode.substring(0, 300)}
\`\`\`

Problem: ${explanation.substring(0, 200)}

Return ONLY the fixed code in diff format.`;

    try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'mistral-small-latest',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 500
            }),
            signal: AbortSignal.timeout(20000)
        });

        if (!response.ok) {
            throw new Error(`Mistral API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;

    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        rotator.markKeyFailed(apiKey, errMsg);
        return null;
    }
}

function determineRiskLevel(issueType: string): 'low' | 'medium' | 'high' | 'critical' {
    const type = issueType.toLowerCase();
    if (type.includes('injection') || type.includes('react2shell') || type.includes('rce')) {
        return 'critical';
    }
    if (type.includes('xss') || type.includes('dangerous')) {
        return 'high';
    }
    if (type.includes('outdated') || type.includes('cve')) {
        return 'medium';
    }
    return 'low';
}

function extractRecommendations(content: string): string[] {
    const recommendations: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        // Look for numbered lists or bullet points
        if (trimmed.match(/^[\d-•*]/)) {
            recommendations.push(trimmed.replace(/^[\d-•*]\s*/, ''));
        }
    }

    return recommendations.length > 0
        ? recommendations
        : ['Sanitize all user inputs', 'Update dependencies', 'Test thoroughly'];
}
