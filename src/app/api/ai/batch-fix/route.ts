import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateMasterFixPrompt } from '@/lib/ai/prompts';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('github_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { repoName, vulnerabilities, techStack, threatIntelligence } = await request.json();

        if (!vulnerabilities || !Array.isArray(vulnerabilities)) {
            return NextResponse.json({ error: 'Invalid vulnerabilities data' }, { status: 400 });
        }

        const prompt = generateMasterFixPrompt({
            repoName,
            vulnerabilities,
            threatIntelligence,
            techStack: {
                reactVersion: techStack?.reactVersion || 'unknown',
                framework: techStack?.hasNext ? 'Next.js' : 'React',
                isTypeScript: techStack?.hasTypeScript || false
            }
        });

        return NextResponse.json({ prompt });
    } catch (error) {
        console.error('[API] Batch prompt failed:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
