export function Footer() {
    return (
        <footer className="py-20 border-t border-border bg-card/50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2 translate-y-[-2px]">
                        <img
                            src="/favicon.png"
                            alt="vulscany Logo"
                            className="w-5 h-5 object-contain invert brightness-200"
                        />
                        <span className="font-mono font-bold tracking-tighter opacity-80">vulscany</span>
                    </div>
                    <div className="flex gap-8 text-sm text-muted-foreground font-mono">
                        <a href="/terms" className="hover:text-foreground">
                            Archive Note
                        </a>
                        <a href="/privacy" className="hover:text-foreground">
                            Publication Safety
                        </a>
                        <a href="https://github.com/instax-dutta/vulscany" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                            GitHub
                        </a>
                    </div>
                    <p className="text-sm text-muted-foreground">Preserved as a public archive after the product was shelved.</p>
                </div>
            </div>
        </footer>
    );
}
