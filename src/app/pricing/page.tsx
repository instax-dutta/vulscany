import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: "Pricing",
    description: "vulscany is MIT-licensed and self-hosted. There is no per-seat pricing, no usage cap, and no hosted plan to buy.",
};

const INCLUDED = [
    "Full scanner, threat intelligence, and fix generation",
    "SARIF, JUnit, Markdown, and JSON reporting",
    "The CLI and every future release",
    "Unlimited repositories and unlimited scans",
    "All updates, on your own schedule",
];

export default function PricingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto space-y-10 py-10">
                    <div className="space-y-4">
                        <h1 className="text-4xl sm:text-5xl font-bold">Pricing</h1>
                        <p className="text-lg text-muted-foreground">
                            There is no pricing page, because there is nothing to buy.
                        </p>
                        <p className="text-foreground/80 leading-relaxed">
                            vulscany is MIT-licensed open-source software that you run yourself. There is no hosted
                            service, no per-seat charge, no scan quota, and no premium tier. Clone it, run it, and keep
                            every finding on your own machine.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 space-y-4">
                        <div className="text-sm font-mono uppercase tracking-wider text-primary">
                            What the license includes
                        </div>
                        <ul className="space-y-3">
                            {INCLUDED.map((item) => (
                                <li key={item} className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <span className="text-foreground/85">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">What it actually costs</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            The software is free. Your real costs are the infrastructure you already have and the
                            optional AI provider you choose to enable.
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="py-3 pr-4 font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                                            Component
                                        </th>
                                        <th className="py-3 pr-4 font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                                            Cost
                                        </th>
                                        <th className="py-3 font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                                            Notes
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-foreground/85">
                                    <tr className="border-b border-border/50">
                                        <td className="py-3 pr-4">vulscany</td>
                                        <td className="py-3 pr-4">Free (MIT)</td>
                                        <td className="py-3">No seat limits, no feature gates</td>
                                    </tr>
                                    <tr className="border-b border-border/50">
                                        <td className="py-3 pr-4">Compute and storage</td>
                                        <td className="py-3 pr-4">Your infrastructure</td>
                                        <td className="py-3">Findings persist to a local JSON file</td>
                                    </tr>
                                    <tr className="border-b border-border/50">
                                        <td className="py-3 pr-4">AI provider (optional)</td>
                                        <td className="py-3 pr-4">Provider pricing</td>
                                        <td className="py-3">Or run Ollama locally for no per-call cost</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 pr-4">GitHub API</td>
                                        <td className="py-3 pr-4">Free tier is usually enough</td>
                                        <td className="py-3">Standard GitHub rate limits apply</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">Privacy, in plain terms</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Repository contents are read through the GitHub API and analyzed in your own process. They
                            are not sent to the maintainers or to any third-party analysis service. If you enable an AI
                            provider, only the specific snippet under analysis is transmitted, under your account and
                            your configuration. Without an AI provider, scanning stays entirely local.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}