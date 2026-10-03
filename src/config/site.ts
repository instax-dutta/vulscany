/**
 * vulscany site configuration
 *
 * Centralized configuration for branding, metadata, and links.
 */

export const SITE_CONFIG = {
    urls: {
        landing: 'http://localhost:3000',
        app: 'http://localhost:3000',
        repo: 'https://github.com/instax-dutta/vulscany',
    },

    branding: {
        name: 'vulscany',
        tagline: 'Local-first AI code security scanning',
        description:
            'vulscany scans GitHub repositories for application-security defects using a pattern prefilter, AI investigation, adversarial revalidation, and verified fixes, then emits SARIF for CI. Source code stays on your machine.',
        internalName: 'vulscany',
    },

    navigation: {
        landing: [
            { label: 'Home', href: '/' },
            { label: 'Why vulscany', href: '/#why' },
            { label: 'Features', href: '/#features' },
            { label: 'Roadmap', href: '/#roadmap' },
        ],
        app: [
            { label: 'Dashboard', href: '/dashboard' },
        ],
    },

    colors: {
        primary: '#00d4ff',
        primaryDark: '#00a8cc',
        primaryLight: '#66e5ff',
        gradient: 'linear-gradient(135deg, #00d4ff 0%, #00ffc8 100%)',
        critical: '#ff0055',
        high: '#ffaa00',
        medium: '#ffc800',
        low: '#00ff88',
    },

    social: {
        github: 'https://github.com/instax-dutta/vulscany',
    },
} as const;

export const getLandingUrl = (path: string = '') => {
    return `${SITE_CONFIG.urls.landing}${path}`;
};

export const getAppUrl = (path: string = '') => {
    return `${SITE_CONFIG.urls.app}${path}`;
};

export const isProduction = () => process.env.NODE_ENV === 'production';
export const isDevelopment = () => process.env.NODE_ENV === 'development';
