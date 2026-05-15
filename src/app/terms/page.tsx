import type { Metadata } from "next"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"

export const metadata: Metadata = {
    title: "VullScanny Archive Note",
    description: "Archive note for the scrapped VullScanny project.",
    openGraph: {
        title: "VullScanny Archive Note",
        description: "This project is no longer an active service.",
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/terms`,
    },
}

export default function TermsPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="space-y-4 border-b border-border pb-8">
                        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
                            Archive Note
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Last Updated: May 15, 2026
                        </p>
                        <p className="text-foreground/80 leading-relaxed">
                            VullScanny is no longer an active product or service. This repository is published as a historical archive
                            of work that was close to launch but ultimately shelved.
                        </p>
                    </div>
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">What this means</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            The code, interface patterns, and internal documentation remain here for reference. Any operational,
                            commercial, or legal language from the original product has been replaced or reduced so the repository does
                            not present itself as a live SaaS offering.
                        </p>
                        <p className="text-foreground/80 leading-relaxed">
                            If you choose to run or fork this code, you are doing so on your own terms and with your own infrastructure,
                            credentials, and compliance obligations.
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </>
    )
}
