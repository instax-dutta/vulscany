import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { proxy } from './proxy';

describe('CSP generation', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('sets Content-Security-Policy response header with non-empty value', () => {
        vi.spyOn(crypto, 'randomUUID').mockReturnValue('test-nonce');
        const req = new NextRequest('http://localhost/');
        const res = proxy(req);
        const csp = res.headers.get('Content-Security-Policy');
        expect(csp).toBeTruthy();
    });

    it('includes base64-encoded nonce in script-src and style-src directives', () => {
        vi.spyOn(crypto, 'randomUUID').mockReturnValue('test-nonce');
        const nonceB64 = Buffer.from('test-nonce').toString('base64');
        const req = new NextRequest('http://localhost/');
        const res = proxy(req);
        const csp = res.headers.get('Content-Security-Policy')!;
        expect(csp).toContain(`'nonce-${nonceB64}'`);
    });

    it('includes all required CSP directives', () => {
        vi.spyOn(crypto, 'randomUUID').mockReturnValue('test-nonce');
        const req = new NextRequest('http://localhost/');
        const res = proxy(req);
        const csp = res.headers.get('Content-Security-Policy')!;
        expect(csp).toContain("default-src 'self'");
        expect(csp).toContain('script-src');
        expect(csp).toContain('style-src');
        expect(csp).toContain('img-src');
        expect(csp).toContain('font-src');
        expect(csp).toContain('connect-src');
        expect(csp).toContain("object-src 'none'");
        expect(csp).toContain("base-uri 'self'");
        expect(csp).toContain("form-action 'self'");
        expect(csp).toContain("frame-ancestors 'none'");
        expect(csp).toContain('upgrade-insecure-requests');
    });

    it('sets x-nonce header on forwarded request for Next.js rendering', () => {
        vi.spyOn(crypto, 'randomUUID').mockReturnValue('test-nonce');
        const nonceB64 = Buffer.from('test-nonce').toString('base64');
        const nextSpy = vi.spyOn(NextResponse, 'next');

        const req = new NextRequest('http://localhost/');
        proxy(req);

        expect(nextSpy).toHaveBeenCalled();
        const options = nextSpy.mock.calls[0][0] as any;
        const forwardedHeaders = options?.request?.headers as Headers;
        expect(forwardedHeaders).toBeDefined();
        expect(forwardedHeaders.get('x-nonce')).toBe(nonceB64);
    });

    it('includes unsafe-eval in script-src when NODE_ENV is development', () => {
        vi.stubEnv('NODE_ENV', 'development');
        vi.spyOn(crypto, 'randomUUID').mockReturnValue('test');
        const req = new NextRequest('http://localhost/');
        const res = proxy(req);
        const csp = res.headers.get('Content-Security-Policy')!;
        expect(csp).toContain("'unsafe-eval'");
    });

    it('excludes unsafe-eval from script-src when NODE_ENV is production', () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.spyOn(crypto, 'randomUUID').mockReturnValue('test');
        const req = new NextRequest('http://localhost/');
        const res = proxy(req);
        const csp = res.headers.get('Content-Security-Policy')!;
        expect(csp).not.toContain('unsafe-eval');
    });
});

describe('Auth guard', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('redirects /dashboard to / when github_token cookie is missing', () => {
        const req = new NextRequest('http://localhost/dashboard');
        const res = proxy(req);
        expect(res.status).toBe(307);
        expect(res.headers.get('Location')).toBe('http://localhost/');
    });

    it('allows /dashboard to pass through when github_token cookie is present', () => {
        const req = new NextRequest('http://localhost/dashboard', {
            headers: { cookie: 'github_token=valid-token' },
        });
        const res = proxy(req);
        expect(res.status).toBe(200);
    });

    it('returns 401 for /api/* requests without github_token cookie', () => {
        const req = new NextRequest('http://localhost/api/scan');
        const res = proxy(req);
        expect(res.status).toBe(401);
    });

    it('returns JSON body with error field for unauthorized API request', async () => {
        const req = new NextRequest('http://localhost/api/scan');
        const res = proxy(req);
        const body = await res.json();
        expect(body).toEqual({ error: 'Unauthorized' });
    });

    it('exempts /api/auth/* routes from auth guard', () => {
        const req = new NextRequest('http://localhost/api/auth/callback');
        const res = proxy(req);
        expect(res.status).toBe(200);
    });

    it('allows /api/* requests to pass through when github_token cookie is present', () => {
        const req = new NextRequest('http://localhost/api/scan', {
            headers: { cookie: 'github_token=valid-token' },
        });
        const res = proxy(req);
        expect(res.status).toBe(200);
    });
});
