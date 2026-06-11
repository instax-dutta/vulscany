import { Eye } from "lucide-react";

export function WhySection() {
    return (
        <section id="why" className="py-24 border-y border-border/50 bg-card/20 scroll-mt-24">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight">Why this project was scrapped.</h2>
                        <div className="space-y-4">
                            {[
                                "vulscany was built to create a defensible, privacy-first application security workflow for fast-moving teams.",
                                "By the time we were nearly ready to launch and monetize, aggressive open source alternatives had weakened the moat we were building toward.",
                                "Rather than force a go-to-market story we no longer believed in, we chose to archive the work publicly as a proof of concept.",
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                    <p className="text-muted-foreground">{item}</p>
                                </div>
                            ))}
                        </div>
                        <div className="pt-6 border-t border-border/50">
                            <p className="text-sm font-mono text-primary/80 uppercase tracking-wider mb-2">Archive Narrative</p>
                            <p className="text-xl font-medium leading-snug">
                                This repository is now a public archive of the product, experiments, and interface ideas we developed while chasing that original thesis.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-square rounded-3xl border border-border bg-card/50 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                            <div className="p-8 font-mono text-sm space-y-4">
                                <div className="flex items-center gap-2 text-primary/60">
                                    <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                                    <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                                    <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
                                </div>
                                <div className="text-foreground/40">$ vulscany archive status</div>
                                <div className="text-primary animate-pulse">Project archived before launch...</div>
                                <div className="space-y-2">
                                    <div className="text-yellow-500/80">[Market] Open source competition compressed differentiation</div>
                                    <div className="text-muted-foreground ml-4">Decision: preserve proof-of-concept code, remove credentials, stop commercialization.</div>
                                    <div className="text-blue-400/80">[Archive] Branding neutralized, deployment scaffolding removed.</div>
                                </div>
                            </div>
                            <div className="absolute bottom-4 right-4 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-xs font-mono">
                                <Eye className="w-4 h-4 mb-2 text-primary" />
                                Public archive only
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
