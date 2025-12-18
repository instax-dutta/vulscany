/**
 * React Project Detection
 * Identifies React projects from package.json
 */

import { getFileContent } from './client';

export interface PackageJson {
    name: string;
    version: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    [key: string]: any;
}

export interface ReactProjectInfo {
    isReact: boolean;
    reactVersion?: string;
    hasReactDOM: boolean;
    hasNext: boolean;
    hasVite: boolean;
    hasTypeScript: boolean;
    dependencies: Record<string, string>;
}

/**
 * Detect if a repository is a React project
 */
export async function detectReactProject(
    accessToken: string,
    owner: string,
    repo: string
): Promise<ReactProjectInfo | null> {
    // Fetch package.json
    const packageFile = await getFileContent(accessToken, owner, repo, 'package.json');

    if (!packageFile) {
        return null; // No package.json, not a Node.js project
    }

    try {
        const packageJson: PackageJson = JSON.parse(packageFile.content);
        const allDeps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };

        const hasReact = 'react' in allDeps;
        const hasReactDOM = 'react-dom' in allDeps;

        if (!hasReact) {
            return null; // Not a React project
        }

        return {
            isReact: true,
            reactVersion: allDeps['react'],
            hasReactDOM,
            hasNext: 'next' in allDeps,
            hasVite: 'vite' in allDeps,
            hasTypeScript: 'typescript' in allDeps,
            dependencies: allDeps
        };
    } catch (error) {
        console.error('[React Detection] Failed to parse package.json:', error);
        return null;
    }
}

/**
 * Check if React version is outdated/vulnerable
 */
export function isReactVersionVulnerable(version: string): {
    isVulnerable: boolean;
    reason?: string;
    recommendedVersion: string;
} {
    // Remove version ranges (^, ~, >=, etc.)
    const cleanVersion = version.replace(/[\^~>=<]/g, '').trim();
    const [major, minor] = cleanVersion.split('.').map(Number);

    // React versions with known security issues
    if (major < 16) {
        return {
            isVulnerable: true,
            reason: 'React version is very outdated and has multiple security vulnerabilities',
            recommendedVersion: '18.2.0'
        };
    }

    if (major === 16 && minor < 14) {
        return {
            isVulnerable: true,
            reason: 'React 16.x versions below 16.14 have known XSS vulnerabilities',
            recommendedVersion: '18.2.0'
        };
    }

    if (major === 17) {
        return {
            isVulnerable: false,
            reason: 'Consider upgrading to React 18 for latest security patches',
            recommendedVersion: '18.2.0'
        };
    }

    return {
        isVulnerable: false,
        recommendedVersion: '18.2.0'
    };
}

/**
 * Check for high-risk dependencies
 */
export function detectHighRiskDependencies(dependencies: Record<string, string>): Array<{
    package: string;
    version: string;
    risk: string;
}> {
    const risks: Array<{ package: string; version: string; risk: string }> = [];

    // Known vulnerable package patterns
    const vulnerablePatterns = {
        'react-dom': (version: string) => {
            const v = version.replace(/[\^~>=<]/g, '');
            const [major] = v.split('.').map(Number);
            if (major < 16) return 'Outdated react-dom with XSS vulnerabilities';
            return null;
        },
        'marked': (version: string) => {
            return 'Markdown parser - ensure proper sanitization is used';
        },
        'dompurify': () => null, // This is actually good!
        'html-react-parser': () => {
            return 'HTML parsing can be risky - ensure input is sanitized';
        }
    };

    for (const [pkg, version] of Object.entries(dependencies)) {
        const checker = vulnerablePatterns[pkg as keyof typeof vulnerablePatterns];
        if (checker) {
            const risk = checker(version);
            if (risk) {
                risks.push({ package: pkg, version, risk });
            }
        }
    }

    return risks;
}
