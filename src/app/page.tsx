"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { WhySection } from "@/components/landing/WhySection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { RoadmapSection } from "@/components/landing/RoadmapSection";
import { FoundersSection } from "@/components/landing/FoundersSection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <Hero />
                <WhySection />
                <FeaturesSection />
                <RoadmapSection />
                <FoundersSection />
            </main>
            <Footer />
        </div>
    );
}
