export function FoundersSection() {
    return (
        <section className="py-32 border-t border-white/5 bg-black/50">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto space-y-16">
                    <div className="text-center space-y-2">
                        <h2 className="text-sm font-mono text-primary/60 uppercase tracking-[0.3em]">The Builders</h2>
                        <p className="text-2xl font-bold tracking-tight text-white/90">Built by engineers who live the shipping life.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
                        <div className="space-y-4 group">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold tracking-tight text-white">Sai Dutta Abhishek Dash</h3>
                                <p className="text-[10px] font-mono text-primary/80 uppercase tracking-widest">AI Integration • Full Stack • Automation</p>
                            </div>
                            <p className="text-sm text-white/50 leading-relaxed group-hover:text-white/70 transition-colors">
                                AI Integration expert and Full-stack engineer specialized in business automation. A serial entrepreneur who has been writing production-grade code since age 10.
                            </p>
                        </div>

                        <div className="space-y-4 group">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold tracking-tight text-white">Tejes Munde</h3>
                                <p className="text-[10px] font-mono text-primary/80 uppercase tracking-widest">Systems • Backend • CS Research</p>
                            </div>
                            <p className="text-sm text-white/50 leading-relaxed group-hover:text-white/70 transition-colors">
                                Backend specialist and Computer Science researcher focused on software testing. A systems engineer and serial entrepreneur building high-integrity infrastructure.
                            </p>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 text-center">
                        <p className="max-w-2xl mx-auto text-[10px] font-mono text-white/30 uppercase tracking-[0.15em] leading-relaxed">
                            Ex-founders of two successfully acquired ventures. Together, they have shipped a prolific ecosystem of Micro-SaaS platforms, developer primitives, and high-impact open-source tools.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
