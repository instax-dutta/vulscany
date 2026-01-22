/**
 * Aeglyn Site Configuration
 * 
 * Centralized configuration for cross-site linking and branding
 */

export const SITE_CONFIG = {
    // Site URLs
    urls: {
        landing: process.env.NODE_ENV === 'production'
            ? 'https://example.com'
            : 'http://localhost:3000',
        app: process.env.NODE_ENV === 'production'
            ? 'https://example.com'
            : 'http://localhost:3000',
    },

    // Branding
    branding: {
        name: 'Aeglyn',
        tagline: 'Privacy-First React Security Scanner',
        description: 'AI-Powered Threat Intelligence for React Applications',
        internalName: 'VulScany', // For development/internal use only
    },

    // Navigation Links
    navigation: {
        landing: [
            { label: 'Home', href: '/' },
            { label: 'Features', href: '/#features' },
            { label: 'How It Works', href: '/#how-it-works' },
            { label: 'Pricing', href: '/#pricing' },
        ],
        app: [
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Scan', href: '/dashboard/scan' },
            { label: 'History', href: '/dashboard/history' },
        ],
    },

    // Theme Colors (Aeglyn Cyan)
    colors: {
        primary: '#00d4ff',
        primaryDark: '#00a8cc',
        primaryLight: '#66e5ff',
        gradient: 'linear-gradient(135deg, #00d4ff 0%, #00ffc8 100%)',

        // Severity colors (unchanged)
        critical: '#ff0055',
        high: '#ffaa00',
        medium: '#ffc800',
        low: '#00ff88',
    },

    // Social Links
    social: {
        github: 'https://github.com/instax-dutta',
        twitter: '#',
        linkedin: '#',
    },

    // Contact
    contact: {
        email: 'support@example.com',
        support: 'https://example.com/support',
    },

    // SEO
    seo: {
        title: 'Aeglyn - AI-Powered React Security Scanner',
        description: 'Privacy-first vulnerability detection for React applications with AI-powered threat intelligence',
        keywords: ['React security', 'vulnerability scanner', 'AI security', 'code analysis', 'threat intelligence'],
        ogImage: '/og-image.png',
    },
} as const;

// Helper functions
export const getLandingUrl = (path: string = '') => {
    return `${SITE_CONFIG.urls.landing}${path}`;
};

export const getAppUrl = (path: string = '') => {
    return `${SITE_CONFIG.urls.app}${path}`;
};

export const isProduction = () => process.env.NODE_ENV === 'production';
export const isDevelopment = () => process.env.NODE_ENV === 'development';
