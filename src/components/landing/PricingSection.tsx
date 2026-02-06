import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PricingSection() {
    return (
        <section id="pricing" className="py-24 scroll-mt-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl font-bold">Transparent Pricing</h2>
                    <p className="text-muted-foreground">Each scan, fix suggestion, or AI explanation costs 1 credit.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {[
                        {
                            name: "Free Tier",
                            price: "$0",
                            credits: "10",
                            sub: "monthly credits",
                            features: ["Manual scanning", "Code diffs", "Community support"],
                        },
                        {
                            name: "Starter",
                            price: "$5",
                            credits: "30",
                            sub: "monthly credits",
                            features: ["Reduced usage cost", "Standard queue", "Email support"],
                            popular: true,
                        },
                        {
                            name: "Pro",
                            price: "$15",
                            credits: "100",
                            sub: "monthly credits",
                            features: ["Cheapest usage rate", "Priority queues", "Priority support"],
                        },
                    ].map((plan, i) =>
                        plan.popular ? (
                            <div key={i} className="relative p-8 rounded-2xl border-2 border-primary bg-primary/5 space-y-6">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                                    Most Popular
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mt-2">
                                        <span className="text-3xl font-bold">{plan.price}</span>
                                        <span className="text-muted-foreground text-sm">/month</span>
                                    </div>
                                </div>
                                <div className="py-4 border-y border-primary/20">
                                    <p className="text-2xl font-bold text-primary">{plan.credits}</p>
                                    <p className="text-xs font-mono text-muted-foreground uppercase">{plan.sub}</p>
                                </div>
                                <ul className="space-y-3 text-sm">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-2">
                                            <ArrowRight className="w-3 h-3 text-primary" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <a href="https://app.example.com" target="_blank" rel="noopener noreferrer">
                                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                                        Get Started
                                    </Button>
                                </a>
                            </div>
                        ) : (
                            <div key={i} className="p-8 rounded-2xl border border-border bg-card/20 space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mt-2">
                                        <span className="text-3xl font-bold">{plan.price}</span>
                                        <span className="text-muted-foreground text-sm">/month</span>
                                    </div>
                                </div>
                                <div className="py-4 border-y border-border">
                                    <p className="text-2xl font-bold">{plan.credits}</p>
                                    <p className="text-xs font-mono text-muted-foreground uppercase">{plan.sub}</p>
                                </div>
                                <ul className="space-y-3 text-sm">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-2 text-muted-foreground">
                                            <ArrowRight className="w-3 h-3 opacity-50" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <a href="https://app.example.com" target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" className="w-full border-border hover:bg-white/5 bg-transparent">
                                        Get Started
                                    </Button>
                                </a>
                            </div>
                        ),
                    )}
                </div>
                <div className="mt-12 text-center">
                    <p className="text-muted-foreground text-sm inline-flex items-center gap-2 p-4 rounded-full border border-border bg-card/10">
                        <span className="font-bold text-foreground">Need more?</span>
                        Buy one-time credit packs anytime. No lock-in, no expiration.
                    </p>
                </div>
            </div>
        </section>
    )
}
