"use client"

import { useState } from "react"
import { Github, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function GitHubAuthButton() {
    const [isLoading, setIsLoading] = useState(false)

    const handleAuth = () => {
        setIsLoading(true)

        const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'GITHUB_CLIENT_ID_PLACEHOLDER',
            redirect_uri: window.location.origin + '/api/auth/callback',
            scope: 'read:user repo',
            state: Math.random().toString(36).substring(7), // CSRF protection
        })

        window.location.href = `https://github.com/login/oauth/authorize?${params}`
    }

    return (
        <Button
            onClick={handleAuth}
            disabled={isLoading}
            className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold flex items-center gap-2 text-base"
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                </>
            ) : (
                <>
                    <Github className="w-4 h-4" />
                    Connect with GitHub
                </>
            )}
        </Button>
    )
}
