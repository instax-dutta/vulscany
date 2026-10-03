import { MetadataRoute } from 'next';

const AI_CRAWLERS = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-Web',
    'anthropic-ai',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
    'Bingbot',
    'DuckAssistBot',
    'CCBot',
    'cohere-ai',
    'Meta-ExternalAgent',
    'YouBot',
];

export default function robots(): MetadataRoute.Robots {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/dashboard'],
            },
            ...AI_CRAWLERS.map(userAgent => ({
                userAgent,
                allow: '/',
                disallow: ['/api/', '/dashboard'],
            })),
        ],
        sitemap: `${base}/sitemap.xml`,
        host: base,
    };
}