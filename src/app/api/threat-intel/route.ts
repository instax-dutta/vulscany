/**
 * Threat Intelligence API
 * Provides real-time CVE and advisory data
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getLatestThreats, analyzeRepositoryThreats, getPackageVulnerabilities } from '@/lib/threat-intel';

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('github_token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    try {
        switch (action) {
            case 'latest':
                const threats = await getLatestThreats();
                return NextResponse.json(threats);

            case 'package':
                const packageName = searchParams.get('package');
                const version = searchParams.get('version');

                if (!packageName || !version) {
                    return NextResponse.json(
                        { error: 'Missing package or version parameter' },
                        { status: 400 }
                    );
                }

                const packageVulns = await getPackageVulnerabilities(packageName, version);
                return NextResponse.json(packageVulns);

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use: latest, package' },
                    { status: 400 }
                );
        }
    } catch (error: unknown) {
        console.error('[ThreatIntel API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch threat intelligence', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('github_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { dependencies } = body;

        if (!dependencies || typeof dependencies !== 'object') {
            return NextResponse.json(
                { error: 'Invalid dependencies object' },
                { status: 400 }
            );
        }

        const intelligence = await analyzeRepositoryThreats(dependencies);
        return NextResponse.json(intelligence);

    } catch (error: unknown) {
        console.error('[ThreatIntel API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze threats', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
