export function FoundersSection() {
    return (
        <section className="py-24 border-t border-border">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    <h2 className="text-2xl font-bold italic opacity-60">
                        "Built by two devs who live the indie builder life."
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <div className="font-bold">Sai Dutta Abhishek Dash</div>
                            <div className="text-xs font-mono text-primary/80">Design Systems • AI Integration</div>
                        </div>
                        <div className="space-y-2">
                            <div className="font-bold">Tejes Munde</div>
                            <div className="text-xs font-mono text-primary/80">Backend • Infra • Security</div>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                        Both have shipped 20+ indie tools and microSaaS experiments in the past.
                    </p>
                </div>
            </div>
        </section>
    )
}
