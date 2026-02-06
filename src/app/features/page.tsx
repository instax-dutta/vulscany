import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { RoadmapSection } from "@/components/landing/RoadmapSection"

export const metadata = {
    title: "Aeglyn Features | AI-Powered Security for Vibe Coders",
    description: "Explore Aeglyn's features: GitHub integration, AI-powered bug detection, local-only scanning, and zero-knowledge static analysis.",
}

export default function FeaturesPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-20">
                <FeaturesSection />
                <RoadmapSection />
            </main>
            <Footer />
        </div>
    )
}
