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

vi.mock('@/lib/rate-limit', () => ({
    rateLimit: vi.fn().mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: 0 }),
}));

// Mock Convex client
vi.mock('@/lib/convex/client', () => ({
    convex: {
        query: vi.fn(),
        mutation: vi.fn(),
    },
    api: {
        users: {
            getById: 'users:getById',
            deductCredits: 'users:deductCredits',
        },
        scanHistory: {
            create: 'scanHistory:create',
        }
    }
}));

describe('API: /api/batch-scan', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 402 if user has insufficient credits for batch', async () => {
        const { convex } = await import('@/lib/convex/client');

        vi.mocked(cookies).mockResolvedValue({
            get: vi.fn().mockImplementation((name: string) => {
                if (name === 'github_token') return { value: 'gh_token' };
                if (name === 'convex_user_id') return { value: 'user_123' };
                return undefined;
            })
        } as any);

        // Mock low balance (needs 2 credits for 2 repos)
        vi.mocked(convex.query).mockResolvedValue({
            creditBalance: 1,
            subscriptionTier: 'free'
        });

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
        expect(response.status).toBe(402);
        const data = await response.json();
        expect(data.error).toBe('Payment Required');
    });

    it('should perform batch scan and deduct credits upfront', async () => {
        const { convex } = await import('@/lib/convex/client');

        vi.mocked(cookies).mockResolvedValue({
            get: vi.fn().mockImplementation((name: string) => {
                if (name === 'github_token') return { value: 'gh_token' };
                if (name === 'convex_user_id') return { value: 'user_123' };
                return undefined;
            })
        } as any);

        // Mock sufficient balance
        vi.mocked(convex.query).mockResolvedValue({
            creditBalance: 10,
            subscriptionTier: 'pro'
        });

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

        // Verify upfront deduction for 2 repos
        expect(convex.mutation).toHaveBeenCalledWith('users:deductCredits', expect.objectContaining({
            userId: 'user_123',
            amount: 2,
            operation: 'batch_scan'
        }));

        // Verify history logging for both repos
        expect(convex.mutation).toHaveBeenCalledWith('scanHistory:create', expect.objectContaining({
            repoName: 'o1/r1',
            scanType: 'batch'
        }));
        expect(convex.mutation).toHaveBeenCalledWith('scanHistory:create', expect.objectContaining({
            repoName: 'o2/r2',
            scanType: 'batch'
        }));

        const data = await response.json();
        expect(data.batchSummary.successful).toBe(2);
    });
});
