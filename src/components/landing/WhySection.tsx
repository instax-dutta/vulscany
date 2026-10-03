import { Eye } from "lucide-react";

export function WhySection() {
    return (
        <section id="why" className="py-24 border-y border-border/50 bg-card/20 scroll-mt-24">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight">Why another scanner would not do.</h2>
                        <div className="space-y-4">
                            {[
                                "SaaS scanners need your code uploaded to someone else's servers and charge per seat to keep doing it.",
                                "Classic open-source CLIs find the bug but leave you with no dashboard, no explanation, and no pull request to review.",
                                "vulscany keeps your code on your machine and still gives you validated fixes and SARIF you can gate CI on.",
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                    <p className="text-muted-foreground">{item}</p>
                                </div>
                            ))}
                        </div>
                        <div className="pt-6 border-t border-border/50">
                            <p className="text-sm font-mono text-primary/80 uppercase tracking-wider mb-2">Local-first, still rigorous</p>
                            <p className="text-xl font-medium leading-snug">
                                Detection is deterministic and auditable. A second pass tries to falsify every finding before it reaches you, and generated fixes must pass a validation ladder before they become a pull request.
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
                                <div className="text-foreground/40">$ vulscany scan --format sarif</div>
                                <div className="text-primary animate-pulse">Scanning acme/web-app...</div>
                                <div className="space-y-2">
                                    <div className="text-yellow-500/80">[prefilter] 214 candidate sites matched across 168 files</div>
                                    <div className="text-muted-foreground ml-4">Step 1 of 4 done. Running revalidation...</div>
                                    <div className="text-blue-400/80">[result] 6 confirmed, 208 rejected, 2 undecided (downgraded)</div>
                                </div>
                            </div>
                            <div className="absolute bottom-4 right-4 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-xs font-mono">
                                <Eye className="w-4 h-4 mb-2 text-primary" />
                                Nothing leaves your machine
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
