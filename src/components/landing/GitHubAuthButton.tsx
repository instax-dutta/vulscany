"use client"

import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"

export function GitHubAuthButton() {
    return (
        <Button
            disabled
            className="h-12 px-8 bg-white text-black hover:bg-white/90 font-bold flex items-center gap-2 text-base transition-all duration-300 shadow-lg shadow-white/10"
        >
            <Github className="w-4 h-4" />
            GitHub auth removed in archive
        </Button>
    )
}
