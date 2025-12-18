import { NextResponse } from 'next/server';
import { syncKnowledgebase } from '@/lib/knowledgebase/vulnerability-db';

export async function POST(request: Request) {
    try {
        await syncKnowledgebase();
        return NextResponse.json({
            success: true,
            message: 'Vulnerability Knowledgebase synced successfully to Redis',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[API] KB Sync failed:', error);
        return NextResponse.json({ error: 'Manual sync failed' }, { status: 500 });
    }
}
