"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GitHubAuthButton } from "./GitHubAuthButton"
import { HERO_COMBOS } from "@/constants/hero-texts"
import { motion, AnimatePresence } from "framer-motion"

export function Hero() {
    const [comboIndex] = useState(() => Math.floor(Math.random() * HERO_COMBOS.length))
    const combo = HERO_COMBOS[comboIndex] ?? HERO_COMBOS[4]

    return (
        <section className="min-h-screen flex items-center justify-center overflow-hidden relative">
            <div className="container mx-auto px-4 text-center relative z-10 py-20 md:py-0 max-w-5xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={comboIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex flex-col items-center"
                    >
                        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent pb-4 leading-[1.05] min-h-[1.2em]">
                            {combo.hero}
                        </h1>
                        <p className="max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed px-4 font-medium min-h-[2em]">
                            {combo.sub}
                        </p>
                    </motion.div>
                </AnimatePresence>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 px-4">
                    <GitHubAuthButton />
                    <a href="/why" className="w-full sm:w-auto">
                        <Button variant="outline" className="h-12 px-8 font-bold flex items-center gap-2 text-base border-border hover:bg-card/40 w-full sm:w-auto">
                            Why it was archived
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </a>
                </div>

                <p className="text-sm font-mono text-muted-foreground/80 lowercase tracking-widest opacity-60">public archive • scrapped before launch • preserved for reference</p>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-primary/10 blur-[120px] rounded-full -z-10" />
            </div>
        </section>
    )
}
