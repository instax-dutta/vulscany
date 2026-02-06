import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { WhySection } from "@/components/landing/WhySection"

export const metadata = {
    title: "Why Aeglyn? | Privacy-First AI Security 2026",
    description: "Understand why we built Aeglyn: to bridge the gap between fast shipping and secure code without sacrificing privacy.",
}

export default function WhyPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-20">
                <WhySection />
            </main>
            <Footer />
        </div>
    )
}
