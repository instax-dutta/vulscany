/**
 * AI Coder Prompt Generator API
 * Generates concise, contextual prompts for AI coding assistants
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('github_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { fileName, codeSnippet, issueType, vulnerability } = await request.json();

        if (!fileName || !issueType || !codeSnippet) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate a crisp, contextual prompt for AI coders
        const prompt = generateAICoderPrompt(fileName, codeSnippet, issueType, vulnerability);

        return NextResponse.json({ prompt });

    } catch (error: any) {
        console.error('[AI Coder Prompt API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate prompt' },
            { status: 500 }
        );
    }
}

function generateAICoderPrompt(
    fileName: string,
    codeSnippet: string,
    issueType: string,
    vulnerability?: any
): string {
    const severity = vulnerability?.severity || 'medium';
    const line = vulnerability?.line || 'unknown';

    // Create a concise, actionable prompt
    const prompt = `Fix ${severity} security issue in ${fileName} (line ${line}):

**Issue:** ${issueType}

**Vulnerable Code:**
\`\`\`typescript
${codeSnippet.trim()}
\`\`\`

**Task:** Refactor this code to eliminate the ${issueType.toLowerCase()} vulnerability while maintaining functionality. Use secure coding practices and add inline comments explaining the fix.

**Requirements:**
- Fix must be production-ready
- Preserve existing functionality
- Add proper input validation/sanitization
- Include brief comment explaining the security improvement`;

    return prompt;
}
