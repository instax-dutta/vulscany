"use client"

import { useState, useEffect } from "react"
import { Shield, Zap, Cpu, Eye, CreditCard, Github, ChevronRight, ArrowRight, Loader2, Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

interface UserSession {
    user: {
        login: string
        name: string
        avatar_url: string
    } | null
}

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [session, setSession] = useState<UserSession | null>(null)
    const [loading, setLoading] = useState(true)
    const [onboardingName, setOnboardingName] = useState<string | null>(null)

    useEffect(() => {
        // Get name from onboarding if exists
        const savedName = localStorage.getItem('aeglyn_user_name')
        if (savedName) setOnboardingName(savedName)

        const fetchSession = async () => {
            try {
                const res = await fetch(`/api/auth/session`)
                if (res.ok) {
                    const data = await res.json()
                    setSession(data)
                }
            } catch (err) {
                console.error("Failed to fetch session", err)
            } finally {
                setLoading(false)
            }
        }
        fetchSession()
    }, [])

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5 group cursor-pointer py-1">
                    <div className="relative w-9 h-9 flex items-center justify-center">
                        <img
                            src="https://mirror.sdad.pro/aeglyn-logo-nobg.png"
                            alt="Aeglyn Logo"
                            className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-all duration-300 invert brightness-200"
                        />
                    </div>
                    <span className="font-mono font-bold tracking-tighter text-xl text-white">
                        AEGLYN
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground mr-auto ml-12">
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

                <div className="hidden md:flex items-center gap-4">
                    {loading ? (
                        <div className="w-8 h-8 rounded-full bg-primary/10 animate-pulse" />
                    ) : session?.user ? (
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                        >
                            <img
                                src={session.user.avatar_url}
                                alt={session.user.login}
                                className="w-6 h-6 rounded-full border border-primary/20"
                            />
                            <span className="text-sm font-mono font-medium text-primary uppercase">
                                {onboardingName || session.user.name || session.user.login}
                            </span>
                        </Link>
                    ) : (
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
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                    onClick={toggleMenu}
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Nav Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-background/95 backdrop-blur-lg border-b border-border/50 py-6 px-4 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <nav className="flex flex-col gap-4">
                        <Link href="/why" className="text-lg font-medium text-muted-foreground hover:text-foreground py-2" onClick={toggleMenu}>
                            Why Aeglyn
                        </Link>
                        <Link href="/features" className="text-lg font-medium text-muted-foreground hover:text-foreground py-2" onClick={toggleMenu}>
                            Features
                        </Link>
                        <Link href="/pricing" className="text-lg font-medium text-muted-foreground hover:text-foreground py-2" onClick={toggleMenu}>
                            Pricing
                        </Link>
                    </nav>
                    <div className="pt-4 border-t border-border/50">
                        {session?.user ? (
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-3 p-3 rounded-xl border border-primary/20 bg-primary/5"
                                onClick={toggleMenu}
                            >
                                <img
                                    src={session.user.avatar_url}
                                    alt={session.user.login}
                                    className="w-10 h-10 rounded-full border border-primary/20"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-mono font-bold text-primary uppercase">
                                        {onboardingName || session.user.name || session.user.login}
                                    </span>
                                    <span className="text-xs text-muted-foreground">Go to Dashboard</span>
                                </div>
                            </Link>
                        ) : (
                            <Link href="/dashboard" className="block" onClick={toggleMenu}>
                                <Button className="w-full font-mono py-6">
                                    <Github className="w-5 h-5 mr-3" />
                                    Sign In with GitHub
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}
