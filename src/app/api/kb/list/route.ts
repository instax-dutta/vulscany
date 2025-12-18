import { NextResponse } from 'next/server';
import { listAllVulnerabilities } from '@/lib/knowledgebase/vulnerability-db';

export async function GET() {
    try {
        const vulnerabilities = await listAllVulnerabilities();
        return NextResponse.json({
            count: vulnerabilities.length,
            vulnerabilities
        });
    } catch (error) {
        console.error('[API] Failed to list vulnerabilities:', error);
        return NextResponse.json({ error: 'Failed to fetch knowledgebase' }, { status: 500 });
    }
}
