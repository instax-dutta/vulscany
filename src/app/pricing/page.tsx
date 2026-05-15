import type { Metadata } from "next"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"

export const metadata: Metadata = {
    title: "VullScanny Archive Status",
    description: "A short explanation of why VullScanny was archived before launch.",
}

export default function PricingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto space-y-6">
                    <h1 className="text-4xl sm:text-5xl font-bold">Archived before launch</h1>
                    <p className="text-lg text-muted-foreground">
                        VullScanny had pricing and monetization plans, but the team chose not to launch them.
                    </p>
                    <p className="text-foreground/80 leading-relaxed">
                        The original business thesis depended on a product moat around a privacy-first, AI-assisted security workflow.
                        As aggressive open source alternatives reached the market, that moat weakened enough that we no longer felt
                        good about shipping the commercial version. This repository is preserved for reference, not as an active service.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    )
}
