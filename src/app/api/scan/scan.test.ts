import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { cookies } from 'next/headers';
import * as scanner from '@/lib/scanner';
import * as stackDetector from '@/lib/github/stack-detector';
import { NextRequest } from 'next/server';

// Mock Next.js headers/cookies
vi.mock('next/headers', () => ({
    cookies: vi.fn(),
}));

// Mock logic
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
            body: JSON.stringify({ owner: 'owner' }) // missing repo
        });

        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    it('should return 400 if not a web app', async () => {
        vi.mocked(cookies).mockResolvedValue({
            get: vi.fn().mockReturnValue({ value: 'token' })
        } as any);

        vi.mocked(stackDetector.detectStack).mockResolvedValue(null);

        const req = new NextRequest('http://localhost/api/scan', {
            method: 'POST',
            body: JSON.stringify({ owner: 'owner', repo: 'repo' })
        });

        const response = await POST(req);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBe('Not a Web application');
    });

    it('should perform scan and return results for valid web app', async () => {
        vi.mocked(cookies).mockResolvedValue({
            get: vi.fn().mockReturnValue({ value: 'token' })
        } as any);

        const mockStack = {
            stack: 'react',
            isReact: true,
            isVue: false,
            isAngular: false,
            isSvelte: false,
            isNextJS: false,
            hasVite: false,
            hasTypeScript: true,
            version: '18',
            dependencies: {}
        };
        vi.mocked(stackDetector.detectStack).mockResolvedValue(mockStack as any);

        const mockScanResult = {
            vulnerabilities: [],
            status: 'safe',
            summary: 'Clean'
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
        expect(data.cached).toBe(false);
    });
});
