import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: "Privacy",
    description: "How vulscany handles your code, your credentials, and your findings. Self-hosted, local-first, no telemetry.",
};

export default function PrivacyPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="space-y-4 border-b border-border pb-8">
                        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
                            Privacy
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            What happens to your code, your tokens, and your findings
                        </p>
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">The short version</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            vulscany is self-hosted software. There is no hosted vulscany service run by the maintainers,
                            so there is nowhere for your code to be uploaded to. Analysis happens in your own process,
                            on your own machine.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">What leaves your machine</h2>
                        <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                            <li>
                                <strong className="text-foreground">Repository contents</strong> are requested from
                                GitHub&apos;s API over HTTPS, then analyzed locally.
                            </li>
                            <li>
                                <strong className="text-foreground">AI analysis, only if you enable it.</strong> When an AI
                                provider such as Mistral is configured, the specific snippet under analysis is sent to that
                                provider under your account. Run Ollama locally to keep even that on your machine.
                            </li>
                            <li>
                                <strong className="text-foreground">Threat intelligence lookups</strong> query public CVE
                                and GitHub Advisory endpoints using your dependency names and versions.
                            </li>
                            <li>
                                <strong className="text-foreground">Pull requests</strong> are created through your own
                                GitHub credentials, only when you ask for one.
                            </li>
                        </ul>
                        <p className="text-foreground/80 leading-relaxed">
                            With no AI provider configured, scanning is entirely local: GitHub reads, local analysis,
                            local storage.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">What is stored, and where</h2>
                        <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                            <li>
                                Scan results and user records persist in <code className="font-mono text-primary">.vulscany/data.json</code>{" "}
                                on your machine. There is no database, no queue, and no cloud storage.
                            </li>
                            <li>
                                Caches are in-process and disappear when the server stops.
                            </li>
                            <li>
                                Your GitHub access token is stored in an HTTP-only, SameSite cookie in your browser
                                session and is never transmitted to the maintainers.
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">Telemetry</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            There is none. vulscany contains no analytics, no error reporting service, and no
                            phone-home mechanism. If you are not the one running the software, nothing is being collected.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">Your responsibilities</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Only scan code you own or have permission to analyze. Review every finding, and review every
                            generated fix, before acting on it. If you enable an AI provider, you are responsible for
                            that provider&apos;s handling of the snippets you send it.
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </>
    );
}