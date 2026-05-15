import { ChevronRight } from "lucide-react"

export function RoadmapSection() {
    return (
        <section id="archive" className="py-24 bg-primary/5 border-y border-primary/10 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-mono font-bold mb-8 flex items-center gap-2">
                        <span className="text-primary">archive</span> Notes
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            "Branding changed to VullScanny across the codebase",
                            "Hardcoded live credential defaults removed from the application",
                            "Static domains and export filenames neutralized for public release",
                            "Launch, pricing, and monetization copy replaced with archive messaging",
                            "Legal-style live service pages collapsed into simple archival notices",
                            "Original architectural experiments preserved for study and reuse",
                            "Docs retained where useful, but reframed as historical context",
                            "Repository prepared for public archival rather than active deployment",
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
