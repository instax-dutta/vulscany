/**
 * AI-Powered Fix Generation API
 * Uses Ollama (primary) and Mistral (fallback) to generate fix suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as OllamaAI from '@/lib/ai/ollama';
import * as MistralAI from '@/lib/ai/mistral';

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('github_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { fileName, codeSnippet, issueType, vulnerableCode } = await request.json();

        if (!fileName || !issueType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Try Ollama first
        let explanation = await OllamaAI.explainVulnerability(fileName, codeSnippet, issueType);

        // Fallback to Mistral if Ollama fails
        if (!explanation) {
            console.log('[AI] Ollama failed, falling back to Mistral');
            explanation = await MistralAI.explainVulnerability(fileName, codeSnippet, issueType);
        }

        if (!explanation) {
            return NextResponse.json({
                error: 'AI service unavailable',
                message: 'Both Ollama and Mistral services are currently unavailable'
            }, { status: 503 });
        }

        // Generate fix suggestion if vulnerable code is provided
        let fixSuggestion = null;
        if (vulnerableCode) {
            fixSuggestion = await OllamaAI.generateFixSuggestion(
                fileName,
                vulnerableCode,
                explanation.summary
            );

            if (!fixSuggestion) {
                fixSuggestion = await MistralAI.generateFixSuggestion(
                    fileName,
                    vulnerableCode,
                    explanation.summary
                );
            }
        }

        return NextResponse.json({
            explanation,
            fixSuggestion
        });

    } catch (error: any) {
        console.error('[AI API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate AI response' },
            { status: 500 }
        );
    }
}
