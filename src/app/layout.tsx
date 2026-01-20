import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = 'https://app.aeglyn.site';
const siteName = 'Aeglyn';
const siteDescription = 'Aeglyn is a GDPR-compliant, real-time AI code scan tool with no data logging. Secure your vibe coding with zero-knowledge static analysis and local-only secrets scanning.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Aeglyn | Privacy-First AI Code Security Scanner 2026',
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  keywords: [
    'privacy-first vibe coding security scanner 2026',
    'AI code scan tool no data logging vibe coders',
    'GDPR compliant real-time vibe code security checker',
    'on-device AI vulnerability scan for no-code startups',
    'zero-knowledge static analysis tool vibe coding 2026',
    'local-only secrets scanner for vibe script kiddies',
    'privacy-first GitHub Copilot security linter 2026',
    'end-to-end encrypted code review tool vibe hackers',
    'Aeglyn',
    'security scanner',
    'vibe coding',
    'react security',
    'automated vulnerability detection'
  ],
  generator: 'VulkanorAI Engine',
  authors: [
    { name: 'Sai Dutta Abhishek Dash' },
    { name: 'Tejes Munde' }
  ],
  creator: 'Aeglyn',
  publisher: 'Aeglyn',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'Aeglyn | Privacy-First AI Code Security Scanner 2026',
    description: 'Secure your vibe coding with zero-knowledge static analysis and local-only secrets scanning.',
    siteName: 'Aeglyn',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Aeglyn Security Scanner',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aeglyn | AI Code Security Scanner',
    description: 'GDPR-compliant, real-time AI code scan tool with no data logging.',
    images: ['/og-image.png'],
    creator: '@AeglynHQ',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: siteUrl,
  },
  category: 'technology',
  classification: 'Security Tools',
  appleWebApp: {
    capable: true,
    title: 'Aeglyn',
    statusBarStyle: 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#00d4ff" />
        <meta name="color-scheme" content="dark" />

        {/* Additional SEO meta tags */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="application-name" content="Aeglyn" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Aeglyn" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Aeglyn',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              },
              description: siteDescription,
              url: siteUrl,
              image: `${siteUrl}/og-image.png`,
              author: [
                {
                  '@type': 'Person',
                  name: 'Sai Dutta Abhishek Dash'
                },
                {
                  '@type': 'Person',
                  name: 'Tejes Munde'
                }
              ],
              publisher: {
                '@type': 'Organization',
                name: 'Aeglyn powered by VulkanorAI',
                url: siteUrl
              },
              featureList: [
                'GitHub OAuth Integration',
                'React Vulnerability Detection',
                'AI-Powered Fix Suggestions',
                'Privacy-First Architecture',
                'Zero Data Storage',
                'GDPR Compliant',
                'Real-time Security Scanning'
              ]
            }).replace(/</g, '\\u003c')
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans selection:bg-primary/30`}
      >
        <div className="digital-grid" />
        {children}
      </body>
    </html>
  );
}
