import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: "Publication Safety",
    description: "Notes on what was removed to make the vulscany repository safer to publish.",
};

export default function PrivacyPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="space-y-4 border-b border-border pb-8">
                        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
                            Publication Safety
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Last Updated: May 15, 2026
                        </p>
                        <p className="text-foreground/80 leading-relaxed">
                            This page explains the cleanup performed to make the repository safer to share publicly.
                        </p>
                    </div>
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">What was removed or neutralized</h2>
                        <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                            <li>Hardcoded credential defaults and live-looking OAuth fallbacks</li>
                            <li>Production-specific domains, cookie scopes, and cross-origin assumptions</li>
                            <li>Launch, pricing, and monetization copy that implied an active commercial product</li>
                            <li>SEO and app-distribution files such as sitemaps, robots allowances, and web manifest metadata</li>
                            <li>Turnkey setup, deployment, and payment-integration guides</li>
                            <li>Old brand references tied to the original product name</li>
                        </ul>
                    </section>
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">What remains</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            The repository still contains preserved product code, but it is no longer packaged as a launch-ready app
                            template. Running any of it now requires deliberate reconstruction of configuration and supporting services.
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </>
    );
}
