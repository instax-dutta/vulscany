import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { SITE_CONFIG } from "@/config/site";

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

const siteName = SITE_CONFIG.branding.name;
const siteDescription = SITE_CONFIG.branding.description;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? SITE_CONFIG.urls.landing;

const keywords = [
    "code security scanner",
    "SAST",
    "AI code review",
    "static analysis",
    "secret detection",
    "SARIF",
    "dependency vulnerabilities",
    "CVE scanner",
    "self-hosted security",
    "local-first security",
    "Next.js security",
    "React security",
];

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: `${siteName} | Local-first AI code security scanning`,
        template: `%s | ${siteName}`,
    },
    description: siteDescription,
    applicationName: siteName,
    keywords,
    authors: [{ name: "vulscany contributors" }],
    creator: "vulscany",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        type: "website",
        url: siteUrl,
        siteName,
        title: `${siteName} | Local-first AI code security scanning`,
        description: siteDescription,
    },
    twitter: {
        card: "summary_large_image",
        title: `${siteName} | Local-first AI code security scanning`,
        description: siteDescription,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "SoftwareApplication",
            name: siteName,
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Any",
            description: siteDescription,
            url: siteUrl,
            codeRepository: SITE_CONFIG.urls.repo,
            license: "https://opensource.org/licenses/MIT",
            softwareVersion: "0.1.0",
            isAccessibleForFree: true,
            offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
            },
            featureList: [
                "Static application security analysis",
                "Secret detection",
                "CVE and GitHub Advisory correlation",
                "Adversarial finding revalidation",
                "AI-assisted fix generation with validation",
                "SARIF 2.1.0 output",
            ],
            keywords: keywords.join(", "),
        },
        {
            "@type": "SoftwareSourceCode",
            name: "vulscany",
            description: siteDescription,
            codeRepository: SITE_CONFIG.urls.repo,
            programmingLanguage: ["TypeScript", "JavaScript"],
            runtimePlatform: "Node.js",
            license: "https://opensource.org/licenses/MIT",
        },
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <head>
                <link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
            </head>
            <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased text-foreground selection:bg-primary/30 min-h-screen flex flex-col`}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <SmoothScroll>
                    <div className="landing-grid" />
                    {children}
                </SmoothScroll>
            </body>
        </html>
    );
}
