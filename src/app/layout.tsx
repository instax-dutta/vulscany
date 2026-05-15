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

const siteName = "VullScanny";
const siteDescription =
  "VullScanny is a public archive of a scrapped AI-assisted security scanning product that was never launched.";

export const metadata: Metadata = {
  title: {
    default: "VullScanny | Archive",
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
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
