import { Shield, Zap, Cpu, Eye, CreditCard, Github } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function FeaturesSection() {
    return (
        <section id="features" className="py-24 scroll-mt-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold">Built for the Vibe Coding Era</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Secure your flow with empathy. We build tools that understand how you work, not tools that slow you
                        down.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            title: "GitHub-Only Login",
                            desc: "Seamless authentication with your GitHub account. No passwords to remember.",
                            icon: Github,
                        },
                        {
                            title: "AI-Powered Insights",
                            desc: "Smart bug detection and actionable suggestions that actually make sense.",
                            icon: Zap,
                        },
                        {
                            title: "Code Explainability",
                            desc: "Understand what your code (or AI-generated code) is doing—not just what's wrong.",
                            icon: Cpu,
                        },
                        {
                            title: "Credit-Based Usage",
                            desc: "10 monthly credits for all. Fair pricing beyond that. Pay for what you use.",
                            icon: CreditCard,
                        },
                        {
                            title: "Privacy-First / No Logs",
                            desc: "Zero-knowledge static analysis tool. No data logging, no intrusive analytics. Your code stays your code.",
                            icon: Eye,
                        },
                        {
                            title: "No Carryforward",
                            desc: "Free credits refresh monthly. Simple, transparent, and predictable.",
                            logo: true,
                        },
                    ].map((feature, i) => (
                        <Card
                            key={i}
                            className="bg-card/30 border-border/50 hover:border-primary/20 transition-all hover:translate-y-[-4px] group"
                        >
                            <CardContent className="p-6 space-y-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                                    {feature.logo ? (
                                        <img src="https://mirror.sdad.pro/vulscany-logo-nobg.png" alt="Logo" className="w-6 h-6 object-contain invert brightness-200" />
                                    ) : (
                                        feature.icon && <feature.icon className="w-5 h-5 text-primary" />
                                    )}
                                </div>
                                <h3 className="font-bold text-lg">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
