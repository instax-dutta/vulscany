/**
 * WebApp Stack Detection
 * Identifies various web frameworks from package.json
 */

import { getFileContent } from './client';

export interface PackageJson {
    name: string;
    version: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    [key: string]: any;
}

export type WebStack = 'react' | 'vue' | 'angular' | 'svelte' | 'nextjs' | 'nuxtjs' | 'other';

export interface WebAppProjectInfo {
    stack: WebStack;
    isReact: boolean;
    isVue: boolean;
    isAngular: boolean;
    isSvelte: boolean;
    isNextJS: boolean;
    version?: string;
    hasVite: boolean;
    hasTypeScript: boolean;
    dependencies: Record<string, string>;
}

/**
 * Detect if a repository is a Web application and identify its stack
 */
export async function detectStack(
    accessToken: string,
    owner: string,
    repo: string
): Promise<WebAppProjectInfo | null> {
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

        const isReact = 'react' in allDeps;
        const isVue = 'vue' in allDeps;
        const isAngular = '@angular/core' in allDeps;
        const isSvelte = 'svelte' in allDeps;
        const isNextJS = 'next' in allDeps;
        const isNuxtJS = 'nuxt' in allDeps;

        if (!isReact && !isVue && !isAngular && !isSvelte && !isNextJS && !isNuxtJS) {
            return {
                stack: 'other',
                isReact: false,
                isVue: false,
                isAngular: false,
                isSvelte: false,
                isNextJS: false,
                hasVite: 'vite' in allDeps,
                hasTypeScript: 'typescript' in allDeps,
                dependencies: allDeps
            };
        }

        let stack: WebStack = 'other';
        let version: string | undefined;

        if (isNextJS) { stack = 'nextjs'; version = allDeps['next']; }
        else if (isNuxtJS) { stack = 'nuxtjs'; version = allDeps['nuxt']; }
        else if (isReact) { stack = 'react'; version = allDeps['react']; }
        else if (isVue) { stack = 'vue'; version = allDeps['vue']; }
        else if (isAngular) { stack = 'angular'; version = allDeps['@angular/core']; }
        else if (isSvelte) { stack = 'svelte'; version = allDeps['svelte']; }

        return {
            stack,
            isReact,
            isVue,
            isAngular,
            isSvelte,
            isNextJS,
            version,
            hasVite: 'vite' in allDeps,
            hasTypeScript: 'typescript' in allDeps,
            dependencies: allDeps
        };
    } catch (error) {
        console.error('[Stack Detection] Failed to parse package.json:', error);
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
    const cleanVersion = version.replace(/[\^~>=<]/g, '').trim();
    const [major, minor] = cleanVersion.split('.').map(Number);

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

    return {
        isVulnerable: false,
        recommendedVersion: '18.2.0'
    };
}

/**
 * Check if Vue version is outdated/vulnerable
 */
export function isVueVersionVulnerable(version: string): {
    isVulnerable: boolean;
    reason?: string;
    recommendedVersion: string;
} {
    const cleanVersion = version.replace(/[\^~>=<]/g, '').trim();
    const [major, minor] = cleanVersion.split('.').map(Number);

    if (major < 2) {
        return {
            isVulnerable: true,
            reason: 'Vue 1.x is legacy and no longer receives security updates',
            recommendedVersion: '3.4.0'
        };
    }

    if (major === 2 && minor < 7) {
        return {
            isVulnerable: true,
            reason: 'Vue 2 versions below 2.7 have known security issues. Vue 2 is EOL.',
            recommendedVersion: '3.4.0'
        };
    }

    return {
        isVulnerable: false,
        recommendedVersion: '3.4.0'
    };
}

/**
 * Check if Angular version is outdated/vulnerable
 */
export function isAngularVersionVulnerable(version: string): {
    isVulnerable: boolean;
    reason?: string;
    recommendedVersion: string;
} {
    const cleanVersion = version.replace(/[\^~>=<]/g, '').trim();
    const [major] = cleanVersion.split('.').map(Number);

    if (major < 12) {
        return {
            isVulnerable: true,
            reason: 'Angular versions below 12 are largely EOL and missing modern security features',
            recommendedVersion: '17.0.0'
        };
    }

    return {
        isVulnerable: false,
        recommendedVersion: '17.0.0'
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
        'marked': () => 'Markdown parser - ensure proper sanitization with DOMPurify',
        'dompurify': () => null,
        'html-react-parser': () => 'HTML parsing can be risky - ensure input is sanitized',
        'axios': (version: string) => {
            const v = version.replace(/[\^~>=<]/g, '');
            if (v.startsWith('0.') && Number(v.split('.')[1]) < 21) return 'Axios versions <0.21.1 have SSRF vulnerabilities';
            return null;
        },
        'lodash': (version: string) => {
            const v = version.replace(/[\^~>=<]/g, '');
            if (v.split('.')[0] === '4' && Number(v.split('.')[1]) < 17) return 'Lodash <4.17.21 has prototype pollution risks';
            return null;
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
