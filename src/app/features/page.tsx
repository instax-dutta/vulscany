import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { RoadmapSection } from "@/components/landing/RoadmapSection"

export const metadata = {
    title: "Aeglyn Features | AI-Powered Security for Vibe Coders",
    description: "Explore Aeglyn's features: GitHub integration, AI-powered bug detection, local-only scanning, and zero-knowledge static analysis.",
}

export default function FeaturesPage() {
    return (
        <div className="py-20">
            <FeaturesSection />
            <RoadmapSection />
        </div>
    )
}
