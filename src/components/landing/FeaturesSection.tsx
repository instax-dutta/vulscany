import { Zap, Cpu, Eye, Github, Shield, Archive } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function FeaturesSection() {
    return (
        <section id="features" className="py-24 scroll-mt-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold">What the team had already built</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        The product was shelved, but the prototype still captures the system design, interface work, and scanning
                        ideas that were close to launch.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            title: "GitHub-Only Login",
                            desc: "A GitHub OAuth-based auth flow wired into the app shell and dashboard experience.",
                            icon: Github,
                        },
                        {
                            title: "AI-Powered Insights",
                            desc: "AI-assisted analysis and explanation flows for vulnerability findings and remediation ideas.",
                            icon: Zap,
                        },
                        {
                            title: "Code Explainability",
                            desc: "UX patterns for making scanner output more interpretable to developers under time pressure.",
                            icon: Cpu,
                        },
                        {
                            title: "Privacy-First Scanner Thesis",
                            desc: "A product direction centered on minimizing code retention and keeping security workflows developer-native.",
                            icon: Eye,
                        },
                        {
                            title: "Security Automation Surface",
                            desc: "Prototype flows for auto-fixes, PR generation, validation, and dashboard-driven remediation.",
                            icon: Shield,
                        },
                        {
                            title: "Archive-Ready Cleanup",
                            desc: "Credentials and launch messaging were stripped so the repository can be shared safely as a public archive.",
                            icon: Archive,
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
