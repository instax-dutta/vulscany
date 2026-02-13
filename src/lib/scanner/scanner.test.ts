import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scanRepository } from './index';
import * as githubClient from '../github/client';
import { WebAppProjectInfo } from '../github/stack-detector';

// Mock GitHub client
vi.mock('../github/client', () => ({
    getFileContent: vi.fn(),
    getDirectoryContents: vi.fn(),
}));

describe('Scanner Logic', () => {
    const mockToken = 'mock-token';
    const mockOwner = 'test-owner';
    const mockRepo = 'test-repo';
    const mockStackInfo: WebAppProjectInfo = {
        stack: 'react',
        isReact: true,
        isVue: false,
        isAngular: false,
        isSvelte: false,
        isNextJS: false,
        hasVite: false,
        version: '18.0.0',
        hasTypeScript: true,
        projectRoot: '',
        dependencies: {
            'react': '18.0.0',
            'axios': '0.19.0'
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should detect dangerouslySetInnerHTML in React files', async () => {
        const mockFileContent = {
            name: 'App.jsx',
            path: 'src/App.jsx',
            content: 'function App() { return <div dangerouslySetInnerHTML={{ __html: "<h1>Hello</h1>" }} />; }',
            sha: 'sha123'
        };

        vi.mocked(githubClient.getDirectoryContents).mockResolvedValueOnce([
            { name: 'src', path: 'src', type: 'dir', size: 0 }
        ]);
        vi.mocked(githubClient.getDirectoryContents).mockResolvedValueOnce([
            { name: 'App.jsx', path: 'src/App.jsx', type: 'file', size: 100 }
        ]);
        vi.mocked(githubClient.getFileContent).mockResolvedValue(mockFileContent);

        const results = await scanRepository(mockToken, mockOwner, mockRepo, mockStackInfo);

        expect(results.vulnerabilities).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: 'dangerous-api',
                    title: 'Unsafe HTML Rendering (React)'
                })
            ])
        );
    });

    it('should detect hardcoded secrets', async () => {
        const mockFileContent = {
            name: 'config.js',
            path: 'src/config.js',
            content: 'const API_KEY = "sk-1234567890abcdef1234567890abcdef";',
            sha: 'sha456'
        };

        vi.mocked(githubClient.getDirectoryContents).mockResolvedValueOnce([
            { name: 'src', path: 'src', type: 'dir', size: 0 }
        ]);
        vi.mocked(githubClient.getDirectoryContents).mockResolvedValueOnce([
            { name: 'config.js', path: 'src/config.js', type: 'file', size: 100 }
        ]);
        vi.mocked(githubClient.getFileContent).mockResolvedValue(mockFileContent);

        const results = await scanRepository(mockToken, mockOwner, mockRepo, mockStackInfo);

        expect(results.vulnerabilities).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: 'secret-exposure',
                    severity: 'critical'
                })
            ])
        );
    });

    it('should ignore patterns in comments', async () => {
        const mockFileContent = {
            name: 'App.jsx',
            path: 'src/App.jsx',
            content: '// dangerouslySetInnerHTML is bad, dont use it\n/* eval("evil") */',
            sha: 'sha789'
        };

        vi.mocked(githubClient.getDirectoryContents).mockResolvedValueOnce([
            { name: 'src', path: 'src', type: 'dir', size: 0 }
        ]);
        vi.mocked(githubClient.getDirectoryContents).mockResolvedValueOnce([
            { name: 'App.jsx', path: 'src/App.jsx', type: 'file', size: 100 }
        ]);
        vi.mocked(githubClient.getFileContent).mockResolvedValue(mockFileContent);

        const results = await scanRepository(mockToken, mockOwner, mockRepo, mockStackInfo);

        expect(results.vulnerabilities.filter(v => v.type === 'dangerous-api' || v.type === 'code-execution-pattern')).toHaveLength(0);
    });

    it('should detect risky dependencies from stack info', async () => {
        vi.mocked(githubClient.getDirectoryContents).mockResolvedValue([]);

        const results = await scanRepository(mockToken, mockOwner, mockRepo, mockStackInfo);

        expect(results.vulnerabilities).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: 'dependency',
                    title: expect.stringContaining('Potentially Risky Dependency')
                })
            ])
        );
    });

    it('should include scanDuration in results', async () => {
        vi.mocked(githubClient.getDirectoryContents).mockResolvedValue([]);

        const results = await scanRepository(mockToken, mockOwner, mockRepo, mockStackInfo);

        expect(results.scanDuration).toBeDefined();
        expect(typeof results.scanDuration).toBe('number');
        expect(results.scanDuration).toBeGreaterThanOrEqual(0);
    });
});
