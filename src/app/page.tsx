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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session")
        const session = await response.json()

        if (session?.user) {
          // User is authenticated, redirect to dashboard
          router.push("/dashboard")
        } else {
          setIsCheckingAuth(false)
        }
      } catch (error) {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-[#00d4ff]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[rgba(0,212,255,0.3)] border-t-[#00d4ff] rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-sm uppercase tracking-widest opacity-70">Detecting Reality...</p>
        </div>
      </div>
    )
  }

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
