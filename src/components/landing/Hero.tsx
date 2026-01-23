"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GitHubAuthButton } from "./GitHubAuthButton"

export function Hero() {
    return (
        <section className="min-h-screen flex items-center justify-center overflow-hidden relative">
            <div className="container mx-auto px-4 text-center relative z-10 py-20 md:py-0 max-w-5xl">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent pb-4 leading-[1.05]">
                    Ship Fast.
                    <br />
                    Stay Secure.
                    <br />
                    <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">Zero Compromise.</span>
                </h1>
                <p className="max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed px-4 font-medium">
                    Privacy-first AI security scanner for developers who move fast.
                    <br className="hidden sm:block" />
                    No data logging. No slowdowns. Just instant vulnerability detection.
                </p>

                {/* Primary CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 px-4">
                    <GitHubAuthButton />
                    <a
                        href="/dashboard"
                    >
                        <Button variant="outline" className="h-12 px-8 font-bold flex items-center gap-2 text-base border-border hover:bg-card/40 w-full sm:w-auto">
                            Get Started
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </a>
                </div>

                <p className="text-sm font-mono text-muted-foreground/80">GDPR compliant • Real-time scanning • Built for vibe coders</p>

                {/* Subtle glow effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-primary/10 blur-[120px] rounded-full -z-10" />
            </div>
        </section>
    )
}
