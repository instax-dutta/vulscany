import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { FeaturesSection } from "@/components/landing/FeaturesSection"

export const metadata = {
    title: "VullScanny Archive",
    description: "A snapshot of what VullScanny had built before the product was shelved.",
}

export default function FeaturesPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-20">
                <FeaturesSection />
            </main>
            <Footer />
        </div>
    )
}
