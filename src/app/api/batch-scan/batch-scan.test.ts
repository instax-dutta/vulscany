import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { cookies } from 'next/headers';
import * as scanner from '@/lib/scanner';
import * as stackDetector from '@/lib/github/stack-detector';
import { NextRequest } from 'next/server';

vi.mock('next/headers', () => ({
    cookies: vi.fn(),
}));

vi.mock('@/lib/scanner', () => ({
    scanRepository: vi.fn(),
}));

vi.mock('@/lib/github/stack-detector', () => ({
    detectStack: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
    rateLimit: vi.fn().mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: 0 }),
}));

vi.mock('@/lib/local-store', () => ({
    addScanRecord: vi.fn(),
}));

describe('API: /api/batch-scan', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if unauthorized', async () => {
        vi.mocked(cookies).mockResolvedValue({
            get: vi.fn().mockReturnValue(undefined)
        } as any);

        const req = new NextRequest('http://localhost/api/batch-scan', {
            method: 'POST',
            body: JSON.stringify({ repositories: [{ owner: 'o1', name: 'r1' }] })
        });

        const response = await POST(req);
        expect(response.status).toBe(401);
    });

    it('should scan repos and log history', async () => {
        vi.mocked(cookies).mockResolvedValue({
            get: vi.fn().mockImplementation((name: string) => {
                if (name === 'github_token') return { value: 'gh_token' };
                if (name === 'session') return { value: JSON.stringify({ user: { id: 12345 } }) };
                return undefined;
            })
        } as any);

        vi.mocked(stackDetector.detectStack).mockResolvedValue({ stack: 'react', dependencies: {} } as any);
        vi.mocked(scanner.scanRepository).mockResolvedValue({ vulnerabilities: [], status: 'safe', summary: 'OK', scanDuration: 100 } as any);

        const req = new NextRequest('http://localhost/api/batch-scan', {
            method: 'POST',
            body: JSON.stringify({
                repositories: [
                    { owner: 'o1', name: 'r1' },
                    { owner: 'o2', name: 'r2' }
                ]
            })
        });

        const response = await POST(req);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.batchSummary.successful).toBe(2);
    });
});
