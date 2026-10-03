import { Zap, Cpu, Eye, Github, Shield, FileCode2, Ban } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function FeaturesSection() {
    return (
        <section id="features" className="py-24 scroll-mt-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold">What vulscany does for you</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Deterministic detection first, AI second, and a falsification pass in between, so you review findings
                        instead of raw regex matches.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            title: "GitHub-Native Scanning",
                            desc: "Sign in with GitHub and scan any repository you can read. Files are read through the API and analyzed in-process.",
                            icon: Github,
                        },
                        {
                            title: "AI-Powered Fixes",
                            desc: "Mistral or local Ollama generate a fix, explain the issue, and open a pull request when a fix is ready.",
                            icon: Zap,
                        },
                        {
                            title: "Adversarial Revalidation",
                            desc: "A second pass tries to falsify each finding. Rejected findings are dropped and undecided ones are downgraded.",
                            icon: Cpu,
                        },
                        {
                            title: "Secrets and Supply Chain",
                            desc: "AWS keys, GitHub and OpenAI tokens, Slack tokens, private keys, plus CVE and GitHub Advisory matching.",
                            icon: Eye,
                        },
                        {
                            title: "SARIF and CI Gates",
                            desc: "Emit SARIF 2.1.0, JUnit, or Markdown, and exit non-zero on high or critical findings to block a merge.",
                            icon: Shield,
                        },
                        {
                            title: "Privacy by Architecture",
                            desc: "No database, no queue, no telemetry. Findings persist to a local JSON file you control.",
                            icon: Ban,
                        },
                    ].map((feature, i) => (
                        <Card
                            key={i}
                            className="bg-card/30 border-border/50 hover:border-primary/20 transition-all hover:translate-y-[-4px] group"
                        >
                            <CardContent className="p-6 space-y-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                                    <feature.icon className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
