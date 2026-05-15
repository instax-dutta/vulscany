/**
 * VullScanny site configuration
 *
 * Centralized configuration for archive-mode branding and links.
 */

export const SITE_CONFIG = {
    urls: {
        landing: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        app: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },

    branding: {
        name: 'VullScanny',
        tagline: 'Archived AI Security Scanner Prototype',
        description: 'A public archive of a scrapped security scanning product',
        internalName: 'VullScanny',
    },

    navigation: {
        landing: [
            { label: 'Home', href: '/' },
            { label: 'Why It Was Scrapped', href: '/#why' },
            { label: 'What Was Built', href: '/#features' },
            { label: 'Archive Notes', href: '/#archive' },
        ],
        app: [
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Scan', href: '/dashboard/scan' },
            { label: 'History', href: '/dashboard/history' },
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
        twitter: '#',
        linkedin: '#',
    },

    contact: {
        email: 'opensource@example.invalid',
        support: '#',
    },

    seo: {
        title: 'VullScanny - Archived Security Scanner Prototype',
        description: 'Public archive of a scrapped AI-assisted application security project',
        keywords: ['security scanner', 'archive', 'prototype', 'appsec', 'public archive'],
        ogImage: '/og-image.png',
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
