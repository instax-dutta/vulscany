import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { server } from '../../../../vitest.setup';
import { http, HttpResponse } from 'msw';
import {
    fetchReactAdvisories,
    fetchAdvisoriesForPackage,
    searchAdvisoriesByKeyword,
} from './github-advisories';

// Mock memory-cache to avoid cache hits during tests
vi.mock('./memory-cache', () => ({
    getCachedThreatData: vi.fn().mockResolvedValue(null),
    setCachedThreatData: vi.fn().mockResolvedValue(undefined),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockHighReactorAdvisory = {
    ghsa_id: 'GHSA-xxxx-xxxx-xxxx',
    summary: 'React XSS vulnerability',
    description: 'A cross-site scripting vulnerability in React',
    severity: 'high',
    published_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
    vulnerabilities: [
        {
            package: { name: 'react', ecosystem: 'npm' },
            vulnerable_version_range: '>=16.0.0 <18.2.0',
            first_patched_version: { identifier: '18.2.0' },
        },
    ],
    references: [{ url: 'https://github.com/advisories/GHSA-xxxx' }],
    cvss: { score: 7.5, vector_string: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N' },
};

const mockModerateAdvisory = {
    ghsa_id: 'GHSA-yyyy-yyyy-yyyy',
    summary: 'React DoS vulnerability',
    description: 'A denial of service in React',
    severity: 'moderate',
    published_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-06-15T00:00:00Z',
    vulnerabilities: [
        {
            package: { name: 'react', ecosystem: 'npm' },
            vulnerable_version_range: '>=17.0.0 <18.3.0',
            first_patched_version: { identifier: '18.3.0' },
        },
    ],
    references: [{ url: 'https://github.com/advisories/GHSA-yyyy' }],
    cvss: { score: 5.0, vector_string: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H' },
};

const mockUnrelatedAdvisory = {
    ghsa_id: 'GHSA-zzzz-zzzz-zzzz',
    summary: 'Unrelated issue',
    description: 'Something about build tools',
    severity: 'low',
    published_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-05-01T00:00:00Z',
    vulnerabilities: [
        {
            package: { name: 'webpack', ecosystem: 'npm' },
            vulnerable_version_range: '*',
        },
    ],
    references: [],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('github-advisories', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // ---- fetchReactAdvisories ----

    describe('fetchReactAdvisories', () => {
        it('should fetch React advisories and return GitHubAdvisory[] with id/summary/severity', async () => {
            expect.hasAssertions();
            vi.useFakeTimers();

            server.use(
                http.get('https://api.github.com/advisories', () =>
                    HttpResponse.json([mockHighReactorAdvisory, mockModerateAdvisory]),
                ),
            );

            const promise = fetchReactAdvisories(5);
            await vi.runAllTimersAsync();
            const result = await promise;

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('GHSA-xxxx-xxxx-xxxx');
            expect(result[0].summary).toBe('React XSS vulnerability');
            expect(result[0].severity).toBe('HIGH');
            // CRITICAL severity sorts first; only HIGH here so second item is moderate
            expect(result[1].id).toBe('GHSA-yyyy-yyyy-yyyy');
        });

        it('should return empty array on API error (403)', async () => {
            expect.hasAssertions();
            vi.useFakeTimers();

            server.use(
                http.get('https://api.github.com/advisories', () =>
                    new HttpResponse(null, { status: 403 }),
                ),
            );

            const promise = fetchReactAdvisories(5);
            await vi.runAllTimersAsync();
            const result = await promise;

            expect(result).toEqual([]);
        });

        it('should return empty array on API error (500)', async () => {
            expect.hasAssertions();
            vi.useFakeTimers();

            server.use(
                http.get('https://api.github.com/advisories', () =>
                    new HttpResponse(null, { status: 500 }),
                ),
            );

            const promise = fetchReactAdvisories(5);
            await vi.runAllTimersAsync();
            const result = await promise;

            expect(result).toEqual([]);
        });

        it('should deduplicate advisories with the same ID', async () => {
            expect.hasAssertions();
            vi.useFakeTimers();

            // Return the same advisory twice so each package request contributes
            // the same ID; dedup should collapse them.
            server.use(
                http.get('https://api.github.com/advisories', () =>
                    HttpResponse.json([mockHighReactorAdvisory, mockHighReactorAdvisory]),
                ),
            );

            const promise = fetchReactAdvisories(5);
            await vi.runAllTimersAsync();
            const result = await promise;

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('GHSA-xxxx-xxxx-xxxx');
        });
    });

    // ---- fetchAdvisoriesForPackage ----

    describe('fetchAdvisoriesForPackage', () => {
        it('should fetch advisories for a specific package and include package name', async () => {
            expect.hasAssertions();
            server.use(
                http.get('https://api.github.com/advisories', () =>
                    HttpResponse.json([mockHighReactorAdvisory]),
                ),
            );

            const result = await fetchAdvisoriesForPackage('react');

            expect(result).toHaveLength(1);
            expect(result[0].vulnerabilities[0].package.name).toBe('react');
        });

        it('should return empty array on error', async () => {
            expect.hasAssertions();
            server.use(
                http.get('https://api.github.com/advisories', () =>
                    new HttpResponse(null, { status: 403 }),
                ),
            );

            const result = await fetchAdvisoriesForPackage('react');
            expect(result).toEqual([]);
        });
    });

    // ---- searchAdvisoriesByKeyword ----

    describe('searchAdvisoriesByKeyword', () => {
        it('should filter advisories by keyword in summary', async () => {
            expect.hasAssertions();
            server.use(
                http.get('https://api.github.com/advisories', () =>
                    HttpResponse.json([mockHighReactorAdvisory, mockUnrelatedAdvisory]),
                ),
            );

            const result = await searchAdvisoriesByKeyword('XSS');

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('GHSA-xxxx-xxxx-xxxx');
        });

        it('should filter advisories by keyword in description', async () => {
            expect.hasAssertions();
            server.use(
                http.get('https://api.github.com/advisories', () =>
                    HttpResponse.json([mockHighReactorAdvisory, mockUnrelatedAdvisory]),
                ),
            );

            const result = await searchAdvisoriesByKeyword('cross-site');

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('GHSA-xxxx-xxxx-xxxx');
        });

        it('should return empty array for non-matching keyword', async () => {
            expect.hasAssertions();
            server.use(
                http.get('https://api.github.com/advisories', () =>
                    HttpResponse.json([mockHighReactorAdvisory, mockUnrelatedAdvisory]),
                ),
            );

            const result = await searchAdvisoriesByKeyword('nonexistent');

            expect(result).toEqual([]);
        });

        it('should do case-insensitive keyword matching', async () => {
            expect.hasAssertions();
            server.use(
                http.get('https://api.github.com/advisories', () =>
                    HttpResponse.json([mockHighReactorAdvisory]),
                ),
            );

            const result = await searchAdvisoriesByKeyword('xss');

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('GHSA-xxxx-xxxx-xxxx');
        });
    });

    // ---- parseAdvisory structural verification ----

    describe('parseAdvisory (structural verification)', () => {
        it('should uppercase severity, structure references, and include CVSS', async () => {
            expect.hasAssertions();
            server.use(
                http.get('https://api.github.com/advisories', () =>
                    HttpResponse.json([mockHighReactorAdvisory]),
                ),
            );

            const result = await fetchAdvisoriesForPackage('react');
            const advisory = result[0];

            expect(advisory.severity).toBe('HIGH');
            expect(advisory.references).toEqual([
                { url: 'https://github.com/advisories/GHSA-xxxx' },
            ]);
            expect(advisory.cvss).toBeDefined();
            expect(advisory.cvss!.score).toBe(7.5);
            expect(advisory.cvss!.vectorString).toBe(
                'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
            );
        });

        it('should populate description from summary when description is missing', async () => {
            expect.hasAssertions();
            const noDescriptionAdvisory = {
                ...mockHighReactorAdvisory,
                description: undefined,
            };
            server.use(
                http.get('https://api.github.com/advisories', () =>
                    HttpResponse.json([noDescriptionAdvisory]),
                ),
            );

            const result = await fetchAdvisoriesForPackage('react');
            expect(result[0].description).toBe('React XSS vulnerability');
        });

        it('should handle advisory with no vulnerabilities or references gracefully', async () => {
            expect.hasAssertions();
            const minimalAdvisory = {
                ghsa_id: 'GHSA-minimal',
                summary: 'Minimal advisory',
                severity: 'low',
                published_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };
            server.use(
                http.get('https://api.github.com/advisories', () =>
                    HttpResponse.json([minimalAdvisory]),
                ),
            );

            const result = await fetchAdvisoriesForPackage('react');
            const advisory = result[0];

            expect(advisory.id).toBe('GHSA-minimal');
            expect(advisory.severity).toBe('LOW');
            expect(advisory.vulnerabilities).toEqual([]);
            expect(advisory.references).toEqual([]);
            expect(advisory.cvss).toBeUndefined();
        });
    });
});
