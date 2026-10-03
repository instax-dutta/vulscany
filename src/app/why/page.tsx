import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { WhySection } from "@/components/landing/WhySection";

export const metadata = {
    title: "Why vulscany",
    description: "Why vulscany scans your code on your machine instead of uploading it to a SaaS security platform.",
};

export default function WhyPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-20">
                <WhySection />
            </main>
            <Footer />
        </div>
    );
}
