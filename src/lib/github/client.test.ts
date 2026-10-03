import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../vitest.setup';
import {
    createGitHubClient,
    fetchUserRepositories,
    getFileContent,
    hasFile,
    getDirectoryContents,
    checkRateLimit,
} from './client';

const TOKEN = 'ghp_supersecrettokenvalue1234567890';

function repo(overrides: Record<string, unknown> = {}) {
    return {
        id: 1,
        name: 'demo',
        full_name: 'acme/demo',
        owner: { login: 'acme' },
        private: false,
        fork: false,
        archived: false,
        html_url: 'https://github.com/acme/demo',
        default_branch: 'main',
        language: 'TypeScript',
        updated_at: '2026-01-01T00:00:00Z',
        ...overrides,
    };
}

beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('createGitHubClient', () => {
    it('returns an Octokit instance', () => {
        expect(createGitHubClient(TOKEN)).toBeDefined();
        expect(typeof createGitHubClient(TOKEN).rest.repos.getContent).toBe('function');
    });
});

describe('fetchUserRepositories', () => {
    it('maps repository fields into the Repository shape', async () => {
        server.use(
            http.get('https://api.github.com/user/repos', () =>
                HttpResponse.json([repo()])
            )
        );

        const repos = await fetchUserRepositories(TOKEN);

        expect(repos).toHaveLength(1);
        expect(repos[0]).toMatchObject({
            name: 'demo',
            owner: 'acme',
            full_name: 'acme/demo',
            isArchived: false,
            isFork: false,
        });
    });

    it('excludes forks and archived repositories by default', async () => {
        server.use(
            http.get('https://api.github.com/user/repos', () =>
                HttpResponse.json([
                    repo({ id: 1 }),
                    repo({ id: 2, fork: true, full_name: 'acme/forked' }),
                    repo({ id: 3, archived: true, full_name: 'acme/old' }),
                ])
            )
        );

        const repos = await fetchUserRepositories(TOKEN);
        expect(repos.map(r => r.id)).toEqual([1]);
    });

    it('includes private repositories only when asked', async () => {
        server.use(
            http.get('https://api.github.com/user/repos', () =>
                HttpResponse.json([repo({ id: 1 }), repo({ id: 2, private: true })])
            )
        );

        expect(await fetchUserRepositories(TOKEN, { includePrivate: false })).toHaveLength(1);
        expect(await fetchUserRepositories(TOKEN, { includePrivate: true })).toHaveLength(2);
    });

    it('includes archived repositories when asked', async () => {
        server.use(
            http.get('https://api.github.com/user/repos', () =>
                HttpResponse.json([repo({ id: 3, archived: true })])
            )
        );

        expect(await fetchUserRepositories(TOKEN, { includeArchived: true })).toHaveLength(1);
    });

    it('throws a generic error that does not leak the token', async () => {
        server.use(
            http.get('https://api.github.com/user/repos', () =>
                HttpResponse.json({ message: 'Bad credentials' }, { status: 401 })
            )
        );

        await expect(fetchUserRepositories(TOKEN)).rejects.toThrow('Failed to fetch repositories from GitHub');
        expect(console.error).not.toHaveBeenCalledWith(
            expect.stringContaining(TOKEN),
            expect.anything()
        );
    });
});

describe('getFileContent', () => {
    it('decodes base64 content into utf-8 text', async () => {
        const text = 'export const secret = 1;\n';
        server.use(
            http.get('https://api.github.com/repos/acme/demo/contents/*', () =>
                HttpResponse.json({
                    type: 'file',
                    name: 'a.ts',
                    path: 'src/a.ts',
                    sha: 'sha1',
                    content: Buffer.from(text).toString('base64'),
                })
            )
        );

        const file = await getFileContent(TOKEN, 'acme', 'demo', 'src/a.ts');
        expect(file).toEqual({
            name: 'a.ts',
            path: 'src/a.ts',
            content: text,
            sha: 'sha1',
        });
    });

    it('returns null when the path is a directory', async () => {
        server.use(
            http.get('https://api.github.com/repos/acme/demo/contents/*', () =>
                HttpResponse.json([
                    { type: 'file', name: 'a.ts', path: 'src/a.ts', sha: 's', content: '' },
                ])
            )
        );

        expect(await getFileContent(TOKEN, 'acme', 'demo', 'src')).toBeNull();
    });

    it('returns null for a 404 rather than throwing', async () => {
        server.use(
            http.get('https://api.github.com/repos/acme/demo/contents/*', () =>
                HttpResponse.json({ message: 'Not Found' }, { status: 404 })
            )
        );

        expect(await getFileContent(TOKEN, 'acme', 'demo', 'missing.ts')).toBeNull();
    });

    it('never logs the access token on failure', async () => {
        server.use(
            http.get('https://api.github.com/repos/acme/demo/contents/*', () =>
                HttpResponse.json({ message: 'Server Error' }, { status: 500 })
            )
        );

        await getFileContent(TOKEN, 'acme', 'demo', 'src/a.ts');

        const logged = vi.mocked(console.error).mock.calls.flat().join(' ');
        expect(logged).not.toContain(TOKEN);
    });
});

describe('hasFile', () => {
    it('returns true when the file exists', async () => {
        server.use(
            http.get('https://api.github.com/repos/acme/demo/contents/*', () =>
                HttpResponse.json({ type: 'file', name: 'package.json', path: 'package.json', sha: 's', content: '' })
            )
        );

        expect(await hasFile(TOKEN, 'acme', 'demo', 'package.json')).toBe(true);
    });

    it('returns false on any failure', async () => {
        server.use(
            http.get('https://api.github.com/repos/acme/demo/contents/*', () =>
                HttpResponse.json({ message: 'Not Found' }, { status: 404 })
            )
        );

        expect(await hasFile(TOKEN, 'acme', 'demo', 'nope.json')).toBe(false);
    });
});

describe('getDirectoryContents', () => {
    it('maps entries and defaults missing size to zero', async () => {
        server.use(
            http.get('https://api.github.com/repos/acme/demo/contents/*', () =>
                HttpResponse.json([
                    { name: 'a.ts', path: 'src/a.ts', type: 'file', size: 120 },
                    { name: 'lib', path: 'src/lib', type: 'dir' },
                ])
            )
        );

        const entries = await getDirectoryContents(TOKEN, 'acme', 'demo', 'src');
        expect(entries).toEqual([
            { name: 'a.ts', path: 'src/a.ts', type: 'file', size: 120 },
            { name: 'lib', path: 'src/lib', type: 'dir', size: 0 },
        ]);
    });

    it('returns an empty array for a missing directory', async () => {
        server.use(
            http.get('https://api.github.com/repos/acme/demo/contents/*', () =>
                HttpResponse.json({ message: 'Not Found' }, { status: 404 })
            )
        );

        expect(await getDirectoryContents(TOKEN, 'acme', 'demo', 'nope')).toEqual([]);
    });

    it('returns an empty array when the path is a single file', async () => {
        server.use(
            http.get('https://api.github.com/repos/acme/demo/contents/*', () =>
                HttpResponse.json({ type: 'file', name: 'a.ts', path: 'a.ts', sha: 's', content: '' })
            )
        );

        expect(await getDirectoryContents(TOKEN, 'acme', 'demo', 'a.ts')).toEqual([]);
    });
});

describe('checkRateLimit', () => {
    it('converts the reset epoch into a Date', async () => {
        const resetSeconds = 1_700_000_000;
        server.use(
            http.get('https://api.github.com/rate_limit', () =>
                HttpResponse.json({ rate: { limit: 5000, remaining: 4999, reset: resetSeconds } })
            )
        );

        const result = await checkRateLimit(TOKEN);
        expect(result.limit).toBe(5000);
        expect(result.remaining).toBe(4999);
        expect(result.reset).toBeInstanceOf(Date);
        expect(result.reset.getTime()).toBe(resetSeconds * 1000);
    });

    it('rethrows the underlying failure', async () => {
        server.use(
            http.get('https://api.github.com/rate_limit', () =>
                HttpResponse.json({ message: 'rate limited' }, { status: 403 })
            )
        );

        await expect(checkRateLimit(TOKEN)).rejects.toThrow();
    });
});