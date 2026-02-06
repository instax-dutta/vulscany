import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { PricingSection } from "@/components/landing/PricingSection"

export const metadata = {
    title: "Aeglyn Pricing | Transparent & Fair for All Developers",
    description: "Simple credit-based pricing. 10 free credits monthly. Only pay for what you use.",
}

export default function PricingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-20">
                <PricingSection />
            </main>
            <Footer />
        </div>
    )
}
