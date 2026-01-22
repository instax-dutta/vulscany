"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GitHubAuthButton } from "./GitHubAuthButton"

export function Hero() {
    return (
        <section className="pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden">
            <div className="container mx-auto px-4 text-center relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent pb-4 leading-[1.1]">
                    Code Smarter.
                    <br />
                    Stay Safer.
                </h1>
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                    A privacy-first vibe coding security scanner built for 2026. Aeglyn is an AI code scan tool with no data logging, designed for vibe coders and no-code startups.
                </p>

                {/* Primary CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                    <GitHubAuthButton />
                    <a
                        href="/dashboard"
                    >
                        <Button variant="outline" className="h-12 px-8 font-bold flex items-center gap-2 text-base border-border hover:bg-card/40">
                            Get Started
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </a>
                </div>

                {/* Secondary CTA */}
                <p className="text-sm text-muted-foreground mb-6">
                    Already have access?{" "}
                    <a
                        href="/dashboard"
                        className="text-primary hover:underline font-medium"
                    >
                        Launch App →
                    </a>
                </p>

                <p className="text-xs font-mono text-muted-foreground">GDPR compliant real-time vibe code security checker.</p>

                {/* Subtle glow effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-primary/10 blur-[120px] rounded-full -z-10" />
            </div>
        </section>
    )
}
