/**
 * AI-Powered Fix Generation API
 * Uses Ollama (primary) and Mistral (fallback) to generate fix suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as OllamaAI from '@/lib/ai/ollama';
import * as MistralAI from '@/lib/ai/mistral';
import { ExplainRequestSchema, sanitizeInput } from '@/lib/validators/api-validators';
import { withTimeout } from '@/lib/utils/promise';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('github_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit AI requests (15 per minute)
    const { success } = await rateLimit(request, 15, 60);
    if (!success) {
        return NextResponse.json({ error: 'Cooldown active', message: 'You are generating fixes too fast!' }, { status: 429 });
    }

    try {
        const body = await request.json();

        // Validate and sanitize input
        const validationResult = ExplainRequestSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Invalid request data',
                details: validationResult.error.format()
            }, { status: 400 });
        }

        const { fileName, codeSnippet, issueType, vulnerableCode, techStack } = validationResult.data;

        // Sanitize code snippets to prevent prompt injection
        const safeCodeSnippet = sanitizeInput(codeSnippet);
        const safeVulnerableCode = vulnerableCode ? sanitizeInput(vulnerableCode) : undefined;

        // Generate the high-quality vibe prompt
        const { generateSingleFixPrompt } = await import('@/lib/ai/prompts');
        const vibePrompt = generateSingleFixPrompt(
            { title: issueType, file: fileName, snippet: safeCodeSnippet, description: '', recommendation: '' },
            techStack || { hasNext: false, hasTypeScript: false }
        );

        // Try Ollama first with 15s timeout
        let explanation;
        try {
            explanation = await withTimeout(
                OllamaAI.explainVulnerability(fileName, safeCodeSnippet, issueType),
                15000,
                'Ollama timeout'
            );
        } catch (err) {
            console.log('[AI] Ollama timeout or error');
        }

        // Fallback to Mistral if Ollama fails or times out
        if (!explanation) {
            try {
                explanation = await withTimeout(
                    MistralAI.explainVulnerability(fileName, safeCodeSnippet, issueType),
                    15000,
                    'Mistral timeout'
                );
            } catch (err) {
                console.error('[AI] Mistral failed too');
            }
        }

        if (!explanation) {
            return NextResponse.json({
                error: 'AI service unavailable',
                message: 'Both Ollama and Mistral services are currently unavailable'
            }, { status: 503 });
        }

        // Generate fix suggestion if vulnerable code is provided
        let fixSuggestion = null;
        if (safeVulnerableCode) {
            fixSuggestion = await OllamaAI.generateFixSuggestion(
                fileName,
                safeVulnerableCode,
                explanation.summary
            );

            if (!fixSuggestion) {
                fixSuggestion = await MistralAI.generateFixSuggestion(
                    fileName,
                    safeVulnerableCode,
                    explanation.summary
                );
            }
        }

        return NextResponse.json({
            explanation,
            fixSuggestion,
            vibePrompt
        });

    } catch (error: any) {
        console.error('[AI API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate AI response' },
            { status: 500 }
        );
    }
}
