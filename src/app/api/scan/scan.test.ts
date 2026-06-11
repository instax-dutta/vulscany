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

vi.mock('@/lib/cache/scan-cache', () => ({
    getCachedScanResult: vi.fn().mockResolvedValue(null),
    cacheScanResult: vi.fn().mockResolvedValue(true),
    invalidateScanCache: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/rate-limit', () => ({
    rateLimit: vi.fn().mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: 0 }),
}));

vi.mock('@/lib/local-store', () => ({
    addScanRecord: vi.fn(),
    updateLastScan: vi.fn(),
}));

describe('API: /api/scan', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if unauthorized', async () => {
        vi.mocked(cookies).mockResolvedValue({
            get: vi.fn().mockReturnValue(undefined)
        } as any);

        const req = new NextRequest('http://localhost/api/scan', {
            method: 'POST',
            body: JSON.stringify({ owner: 'owner', repo: 'repo' })
        });

        const response = await POST(req);
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 if owner or repo is missing', async () => {
        vi.mocked(cookies).mockResolvedValue({
            get: vi.fn().mockReturnValue({ value: 'token' })
        } as any);

        const req = new NextRequest('http://localhost/api/scan', {
            method: 'POST',
            body: JSON.stringify({ owner: 'owner' })
        });

        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    it('should perform scan and log history for valid web app', async () => {
        vi.mocked(cookies).mockResolvedValue({
            get: vi.fn().mockImplementation((name: string) => {
                if (name === 'github_token') return { value: 'gh_token' };
                if (name === 'session') return { value: JSON.stringify({ user: { id: 12345 } }) };
                return undefined;
            })
        } as any);

        const mockStack = {
            stack: 'react',
            dependencies: {}
        };
        vi.mocked(stackDetector.detectStack).mockResolvedValue(mockStack as any);

        const mockScanResult = {
            vulnerabilities: [],
            status: 'safe',
            summary: 'Clean',
            scanDuration: 1500
        };
        vi.mocked(scanner.scanRepository).mockResolvedValue(mockScanResult as any);

        const req = new NextRequest('http://localhost/api/scan', {
            method: 'POST',
            body: JSON.stringify({ owner: 'owner', repo: 'repo' })
        });

        const response = await POST(req);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.scanResult).toBeDefined();
    });
});
