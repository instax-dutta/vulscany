"use client"

import { Shield, Zap, Cpu, Eye, CreditCard, Github, ChevronRight, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5 group cursor-pointer py-1">
                    <div className="relative w-9 h-9 flex items-center justify-center">
                        <img
                            src="https://mirror.sdad.pro/vulscany-logo-nobg.png"
                            alt="Aeglyn Logo"
                            className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-all duration-300 invert brightness-200"
                        />
                    </div>
                    <span className="font-mono font-bold tracking-tighter text-xl text-white">
                        AEGLYN
                    </span>
                </Link>
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                    <Link href="/why" className="hover:text-foreground transition-colors">
                        Why
                    </Link>
                    <Link href="/features" className="hover:text-foreground transition-colors">
                        Features
                    </Link>
                    <Link href="/pricing" className="hover:text-foreground transition-colors">
                        Pricing
                    </Link>
                </nav>
                <Link href="/dashboard">
                    <Button
                        variant="outline"
                        size="sm"
                        className="font-mono border-primary/20 hover:bg-primary/5 hover:border-primary/40 bg-transparent"
                    >
                        <Github className="w-4 h-4 mr-2" />
                        Login
                    </Button>
                </Link>
            </div>
        </header>
    )
}
