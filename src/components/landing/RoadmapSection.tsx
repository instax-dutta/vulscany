import { ChevronRight } from "lucide-react"

export function RoadmapSection() {
    return (
        <section className="py-24 bg-primary/5 border-y border-primary/10 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-mono font-bold mb-8 flex items-center gap-2">
                        <span className="text-primary">0.1.0</span> Roadmap
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            "CLI Integration",
                            "GitHub PR AI Summaries",
                            "Local-Only Secrets Scanner",
                            "Privacy-First GitHub Copilot Security Linter 2026",
                            "End-to-End Encrypted Code Review Tool",
                            "Slack/Discord Alerts",
                            "Advanced AI Explain Mode",
                            "One-Click Fixes for Vibe Hackers",
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background/50 text-sm font-mono"
                            >
                                <ChevronRight className="w-4 h-4 text-primary" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full" />
        </section>
    )
}
