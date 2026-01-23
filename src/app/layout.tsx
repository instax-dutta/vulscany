import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = 'https://example.com';
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased text-foreground selection:bg-primary/30 min-h-screen flex flex-col`}>
        <SmoothScroll>
          {/* Subtle Grid Background */}
          <div className="landing-grid" />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
