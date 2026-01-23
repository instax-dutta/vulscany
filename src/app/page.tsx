"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/landing/Navbar"
import { Hero } from "@/components/landing/Hero"
import { WhySection } from "@/components/landing/WhySection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { RoadmapSection } from "@/components/landing/RoadmapSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { FoundersSection } from "@/components/landing/FoundersSection"
import { Footer } from "@/components/landing/Footer"

export default function LandingPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Removed auto-redirect to dashboard to avoid "initial loading screen" flash
  // and ensure the landing page is always accessible first.
  useEffect(() => {
    setIsCheckingAuth(false)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <WhySection />
        <FeaturesSection />
        <RoadmapSection />
        <PricingSection />
        <FoundersSection />
      </main>
      <Footer />
    </div>
  )
}
