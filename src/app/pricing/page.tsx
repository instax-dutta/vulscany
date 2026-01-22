import { PricingSection } from "@/components/landing/PricingSection"

export const metadata = {
    title: "Aeglyn Pricing | Transparent & Fair for All Developers",
    description: "Simple credit-based pricing. 10 free credits monthly. Only pay for what you use.",
}

export default function PricingPage() {
    return (
        <div className="py-20">
            <PricingSection />
        </div>
    )
}
