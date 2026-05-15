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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const siteName = 'VullScanny';
const siteDescription = 'VullScanny is a public archive of a scrapped AI-assisted security scanning product that was never launched.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'VullScanny | Public Archive',
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  keywords: [
    'VullScanny',
    'public archive',
    'scrapped startup',
    'security scanner prototype',
    'application security',
    'open source competition'
  ],
  generator: 'VullScanny Archive',
  authors: [
    { name: 'Sai Dutta Abhishek Dash' },
    { name: 'Tejes Munde' }
  ],
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
    title: 'VullScanny | Scrapped Product Archive',
    description: 'A public archive of a near-launch security product that was shelved after open source alternatives eroded the original moat.',
    siteName: 'VullScanny',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VullScanny archive',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VullScanny | Public Archive',
    description: 'A scrapped AI security scanner preserved as a public code archive.',
    images: ['/og-image.png'],
    creator: '@VullScanny',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
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
  classification: 'Software Archive',
  appleWebApp: {
    capable: true,
    title: 'VullScanny',
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
          <div className="landing-grid" />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
