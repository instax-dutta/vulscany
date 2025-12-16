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

const siteUrl = 'https://vullscanny.sdad.pro';
const siteName = 'VullScanny';
const siteDescription = 'Privacy-first React security scanner for GitHub repositories. Scan your React projects for XSS, injection vulnerabilities, and dangerous patterns. Your code is never stored.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Privacy-First React Security Scanner`,
    template: `%s | ${siteName}`
  },
  description: '🚀 NEW: VullScanny now features advanced threat intelligence with real-time CVE tracking and zero-day detection! Privacy-first React security scanner powered by VulkanorAI. Automate XSS detection, prevent injection attacks, and audit your GitHub repositories instantly with comprehensive risk analysis.',
  keywords: [
    // Core Functionality
    'react security scanner',
    'automated vulnerability detection',
    'fix react xss',
    'javascript static analysis',
    'github security audit',

    // Brand & Tech
    'VulkanorAI',
    'VullScanny',
    'sdad.pro',
    'SDAD security',

    // Specific Threats
    'react injection vulnerabilities',
    'identifying dangerous code patterns',
    'next.js security best practices',
    'unsafe dependencies check',

    // Developer Intent
    'audit github repo',
    'secure code review automation',
    'developer cyber security tools',
    'privacy-first code analysis'
  ],
  generator: 'VulkanorAI Engine',
  authors: [{ name: 'Sai Dutta Abhishek Dash', url: 'https://sdad.pro' }],
  creator: 'VullScanny',
  publisher: 'VullScanny',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: `${siteName} - Privacy-First React Security Scanner`,
    description: siteDescription,
    siteName: siteName,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'VullScanny - React Security Scanner',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} - Privacy-First React Security Scanner`,
    description: siteDescription,
    images: [`${siteUrl}/og-image.png`],
    creator: '@vulnscany',
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

  manifest: '/manifest.json',
  alternates: {
    canonical: siteUrl,
  },
  category: 'technology',
  classification: 'Security Tools',
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: 'black-translucent',
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // other: 'your-other-verification-code',
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
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="dark" />

        {/* Additional SEO meta tags */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="application-name" content="VullScanny" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VullScanny" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'VullScanny',
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
              author: {
                '@type': 'Organization',
                name: 'SDAD.pro',
                url: 'https://sdad.pro',
                logo: 'https://sdad.pro/logo.png', // Assuming standard logo path or can use the app icon
                sameAs: [
                  'https://github.com/saiduttaabhishekdash',
                  'https://twitter.com/saiduttaabhishekdash'
                ]
              },
              publisher: {
                '@type': 'Organization',
                name: 'VullScanny powered by VulkanorAI',
                url: siteUrl
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '5.0',
                ratingCount: '1'
              },
              featureList: [
                'GitHub OAuth Integration',
                'React Vulnerability Detection',
                'AI-Powered Fix Suggestions',
                'Privacy-First Architecture',
                'Zero Data Storage',
                'XSS Detection',
                'Injection Risk Analysis'
              ]
            })
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-gray-950 text-gray-100 font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
