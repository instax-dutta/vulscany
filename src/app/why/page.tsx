import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { WhySection } from "@/components/landing/WhySection"

export const metadata = {
    title: "Why It Was Archived",
    description: "Why the VullScanny team archived the project instead of launching it.",
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
