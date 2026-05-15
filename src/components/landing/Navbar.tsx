"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5 group cursor-pointer py-1">
                    <div className="relative w-9 h-9 flex items-center justify-center">
                        <img
                            src="/favicon.png"
                            alt="VullScanny Logo"
                            className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-all duration-300 invert brightness-200"
                        />
                    </div>
                    <span className="font-mono font-bold tracking-tighter text-xl text-white">
                        VULLSCANNY
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground mr-auto ml-12">
                    <Link href="/why" className="hover:text-foreground transition-colors">
                        Why Archived
                    </Link>
                    <Link href="/features" className="hover:text-foreground transition-colors">
                        Preserved Work
                    </Link>
                    <Link href="/privacy" className="hover:text-foreground transition-colors">
                        Cleanup Notes
                    </Link>
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    <Link href="/terms">
                        <Button
                            variant="outline"
                            size="sm"
                            className="font-mono border-primary/20 hover:bg-primary/5 hover:border-primary/40 bg-transparent"
                        >
                            Archive Note
                        </Button>
                    </Link>
                </div>

                <button
                    className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                    onClick={toggleMenu}
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-background/95 backdrop-blur-lg border-b border-border/50 py-6 px-4 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <nav className="flex flex-col gap-4">
                        <Link href="/why" className="text-lg font-medium text-muted-foreground hover:text-foreground py-2" onClick={toggleMenu}>
                            Why Archived
                        </Link>
                        <Link href="/features" className="text-lg font-medium text-muted-foreground hover:text-foreground py-2" onClick={toggleMenu}>
                            Preserved Work
                        </Link>
                        <Link href="/privacy" className="text-lg font-medium text-muted-foreground hover:text-foreground py-2" onClick={toggleMenu}>
                            Cleanup Notes
                        </Link>
                    </nav>
                    <div className="pt-4 border-t border-border/50">
                        <Link href="/terms" className="block" onClick={toggleMenu}>
                            <Button className="w-full font-mono py-6">
                                Archive Note
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </header>
    )
}
