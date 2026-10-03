import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: "Terms of Use",
    description: "Terms for using vulscany, the open-source local-first code security scanner.",
};

const SECTIONS: { heading: string; body: string[] }[] = [
    {
        heading: "1. Acceptance",
        body: [
            "vulscany is open-source software released under the MIT License. By downloading, installing, or running the software you agree to this document and to the license terms in the repository's LICENSE file.",
            "If you do not agree with these terms, do not use the software.",
        ],
    },
    {
        heading: "2. What you run",
        body: [
            "vulscany is self-hosted software. There is no hosted vulscany service operated by the maintainers. You run it on your own hardware, in your own environment, against your own repositories and your own network.",
            "The maintainers distribute source code only. They do not operate the software on your behalf, do not hold your repository credentials, and do not have access to the data your instance produces.",
        ],
    },
    {
        heading: "3. Your responsibilities",
        body: [
            "You are responsible for the repositories you scan, for the GitHub credentials and API tokens you configure, and for complying with the license terms of the software you scan.",
            "Only scan code you own or have permission to analyze. Scanning third-party code without authorization may violate that project's license or applicable law.",
            "You are responsible for the generated findings, including reviewing and verifying them before acting on them. Security findings are advisory output, not a guarantee of security.",
        ],
    },
    {
        heading: "4. No warranty",
        body: [
            "The software is provided \"as is\", without warranty of any kind, as stated in the MIT License. vulscany can report false positives, miss vulnerabilities, and produce fix suggestions that are incorrect or unsafe to apply.",
            "Automated fix suggestions must be reviewed by a human before they are merged or deployed. vulscany's validation ladder reduces obvious breakage; it does not certify correctness.",
        ],
    },
    {
        heading: "5. Limitation of liability",
        body: [
            "To the maximum extent permitted by law, the maintainers and contributors are not liable for any claim, damages, loss of data, or other liability arising from the use of, or inability to use, the software.",
            "This limitation applies regardless of the legal theory, even where the maintainers were advised of the possibility of such damages.",
        ],
    },
    {
        heading: "6. AI-generated output",
        body: [
            "If you enable an AI provider such as Mistral or a local Ollama instance, the code you analyze may be sent to that provider under your own account and configuration. Review your provider's terms before enabling it.",
            "AI-generated explanations and fixes are unverified suggestions and can contain errors, insecure patterns, or fabricated content. You retain full responsibility for anything you apply.",
        ],
    },
    {
        heading: "7. Security reports",
        body: [
            "Please report suspected vulnerabilities in vulscany through GitHub Security Advisories on the repository rather than as a public issue, so a fix can be prepared before disclosure.",
        ],
    },
    {
        heading: "8. Changes",
        body: [
            "These terms may change as the project evolves. The current version in the repository at the commit you are running is the version that applies to you.",
        ],
    },
];

export default function TermsPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="space-y-4 border-b border-border pb-8">
                        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
                            Terms of Use
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Applies to the vulscany open-source project
                        </p>
                    </div>

                    <div className="space-y-8">
                        {SECTIONS.map((section) => (
                            <section key={section.heading} className="space-y-3">
                                <h2 className="text-2xl font-bold text-foreground">{section.heading}</h2>
                                {section.body.map((paragraph) => (
                                    <p key={paragraph} className="text-foreground/80 leading-relaxed">
                                        {paragraph}
                                    </p>
                                ))}
                            </section>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}