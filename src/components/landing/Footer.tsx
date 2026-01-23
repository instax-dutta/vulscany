import { Shield, Zap, Cpu, Eye, CreditCard, Github, ChevronRight, ArrowRight } from "lucide-react"

export function Footer() {
    return (
        <footer className="py-20 border-t border-border bg-card/50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2 translate-y-[-2px]">
                        <img
                            src="https://mirror.sdad.pro/vulscany-logo-nobg.png"
                            alt="Aeglyn Logo"
                            className="w-5 h-5 object-contain invert brightness-200"
                        />
                        <span className="font-mono font-bold tracking-tighter opacity-80">AEGLYN</span>
                    </div>
                    <div className="flex gap-8 text-sm text-muted-foreground font-mono">
                        <a href="/terms" className="hover:text-foreground">
                            Terms
                        </a>
                        <a href="/privacy" className="hover:text-foreground">
                            Privacy
                        </a>
                        <a href="https://github.com/vulscany" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                            GitHub
                        </a>
                        <a href="https://x.com/AeglynHQ" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                            X (Twitter)
                        </a>
                    </div>
                    <p className="text-sm text-muted-foreground">Built for developers, by developers.</p>
                </div>
            </div>
        </footer>
    )
}
