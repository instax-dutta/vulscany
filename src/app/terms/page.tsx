import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Terms of Service | Aeglyn - Privacy-First Code Security Platform",
    description: "Terms of Service for Aeglyn, the privacy-first AI vulnerability scanner for indie developers. Learn about GitHub OAuth security, API usage, and developer tool policies.",
    keywords: [
        "zero-log AI vulnerability scanner 2026",
        "real-time AI code security no logging",
        "GDPR compliant AI vulnerability detection",
        "zero-knowledge AI app sec pipeline",
        "privacy-first SAST AI tool",
        "vibe coders security scanner",
        "indie developer code scanning",
        "Aeglyn terms",
    ],
    openGraph: {
        title: "Terms of Service | Aeglyn",
        description: "Terms of Service for Aeglyn's privacy-first code security platform",
        url: "https://aeglyn.site/terms",
    },
}

export default function TermsPage() {
    return (
        <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="space-y-4 border-b border-border pb-8">
                        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
                            Terms of Service
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Last Updated: January 18, 2026
                        </p>
                        <p className="text-foreground/80">
                            Welcome to Aeglyn, the <strong>Zero-Log AI Vulnerability Scanner</strong> built for vibe coders, indie developers, and solopreneurs.
                            By using our real-time AI code security platform and GDPR-compliant GitHub integration, you agree to these terms.
                        </p>
                    </div>

                    {/* 1. Acceptance of Terms */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            By accessing or using Aeglyn ("Service", "Platform", "we", "us", or "our"), you agree to be bound by these
                            Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
                        </p>
                        <p className="text-foreground/80 leading-relaxed">
                            Aeglyn is a privacy-first code scanning platform designed for developers who value security without
                            compromising on privacy. Our Service integrates with GitHub to provide real-time vulnerability scanning,
                            AI-powered explainability, and developer-focused tooling.
                        </p>
                    </section>

                    {/* 2. Service Description */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">2. Service Description</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Aeglyn provides the following core features:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                            <li><strong>GitHub Integration:</strong> Secure GitHub OAuth authentication and repository access</li>
                            <li><strong>Vulnerability Scanning:</strong> AI-powered code security analysis and threat detection</li>
                            <li><strong>AI Explainability:</strong> Clear, actionable insights into security vulnerabilities</li>
                            <li><strong>Developer Tooling:</strong> APIs, CLI tools, and integrations for seamless workflows</li>
                            <li><strong>Privacy-First Architecture:</strong> Temporary processing with no long-term code storage</li>
                        </ul>
                        <p className="text-foreground/80 leading-relaxed">
                            Our code security platform is designed specifically for indie developers and small teams who need
                            enterprise-grade security without the enterprise complexity.
                        </p>
                    </section>

                    {/* 3. User Responsibilities */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">3. User Responsibilities</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            As a user of our privacy-first developer tool, you agree to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                            <li>Provide accurate and complete information during registration</li>
                            <li>Maintain the security of your account credentials and GitHub OAuth tokens</li>
                            <li>Use the Service only for lawful purposes and in accordance with these Terms</li>
                            <li>Not attempt to reverse engineer, decompile, or extract our AI models or algorithms</li>
                            <li>Not use the Service to scan repositories you don't have authorization to access</li>
                            <li>Not abuse, harass, or harm other users or our systems</li>
                            <li>Comply with GitHub's Terms of Service and API usage policies</li>
                            <li>Report any security vulnerabilities or bugs responsibly</li>
                        </ul>
                    </section>

                    {/* 4. API and AI Usage Disclaimer */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">4. API and AI Usage Disclaimer</h2>
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 space-y-3">
                            <h3 className="text-xl font-semibold text-foreground">AI Vulnerability Scanner Limitations</h3>
                            <p className="text-foreground/80 leading-relaxed">
                                While our AI vulnerability scanner is designed to identify security issues in your code, it is not
                                infallible. You acknowledge that:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                                <li>AI-generated security insights are probabilistic and may contain false positives or false negatives</li>
                                <li>The Service should complement, not replace, human code review and security audits</li>
                                <li>We do not guarantee detection of all vulnerabilities or security issues</li>
                                <li>You remain solely responsible for the security of your code and applications</li>
                                <li>AI models may evolve, and results may vary over time as we improve our algorithms</li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-foreground">API Usage and Rate Limits</h3>
                            <p className="text-foreground/80 leading-relaxed">
                                Our developer tool APIs are subject to rate limits and fair usage policies. We reserve the right to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                                <li>Implement and modify rate limits to ensure service stability</li>
                                <li>Throttle or temporarily suspend access for excessive usage</li>
                                <li>Require API authentication and usage tracking</li>
                                <li>Charge for API usage beyond free tier limits (when applicable)</li>
                            </ul>
                        </div>
                    </section>

                    {/* 5. Account Registration and Restrictions */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">5. Account Registration and Restrictions</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            To use Aeglyn's code security platform, you must:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                            <li>Be at least 18 years old or have parental/guardian consent</li>
                            <li>Authenticate via GitHub OAuth with a valid GitHub account</li>
                            <li>Provide accurate contact information for account recovery and notifications</li>
                            <li>Maintain one account per user (no duplicate or fake accounts)</li>
                        </ul>
                        <p className="text-foreground/80 leading-relaxed mt-4">
                            We reserve the right to refuse service, terminate accounts, or remove content at our sole discretion,
                            including but not limited to violations of these Terms, abusive behavior, or fraudulent activity.
                        </p>
                    </section>

                    {/* 6. Fair Usage Policy */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">6. Fair Usage Policy</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Aeglyn is designed for indie developers and small teams. To ensure fair access for all users:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                            <li>Automated scanning should be reasonable and not excessive</li>
                            <li>Bulk scanning of hundreds of repositories may be subject to review</li>
                            <li>Commercial reselling of our Service is prohibited without written agreement</li>
                            <li>Resource-intensive operations may be throttled during peak times</li>
                            <li>We may implement usage caps based on your subscription tier</li>
                        </ul>
                        <p className="text-foreground/80 leading-relaxed mt-4">
                            If you need higher limits for legitimate use cases, please contact us at{" "}
                            <a href="mailto:support@aeglyn.site" className="text-primary hover:underline">
                                support@aeglyn.site
                            </a>
                        </p>
                    </section>

                    {/* 7. Intellectual Property Rights */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">7. Intellectual Property Rights</h2>
                        <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-foreground">Our IP</h3>
                            <p className="text-foreground/80 leading-relaxed">
                                The Service, including but not limited to our AI models, algorithms, user interface, branding, and
                                documentation, is owned by Aeglyn and protected by copyright, trademark, and other intellectual
                                property laws. You may not copy, modify, distribute, or create derivative works without our explicit
                                written permission.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-foreground">Your Code</h3>
                            <p className="text-foreground/80 leading-relaxed">
                                You retain all rights to your source code. By using our privacy-first code scanning service, you grant
                                us a limited, temporary license to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                                <li>Access and analyze your code for vulnerability scanning purposes</li>
                                <li>Process your code through our AI models to generate security insights</li>
                                <li>Store metadata about scan results (but not your actual source code)</li>
                            </ul>
                            <p className="text-foreground/80 leading-relaxed mt-3">
                                This license terminates when you delete your account or remove repository access. We do not claim
                                ownership of your code and will not use it for any purpose other than providing the Service.
                            </p>
                        </div>
                    </section>

                    {/* 8. Data Processing and GitHub Integration */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">8. Data Processing and GitHub Integration</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Our GitHub OAuth security integration requires specific permissions to function:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                            <li>Read access to your repositories for vulnerability scanning</li>
                            <li>Access to repository metadata (name, description, language, etc.)</li>
                            <li>OAuth tokens for authentication (stored securely, never logged)</li>
                        </ul>
                        <p className="text-foreground/80 leading-relaxed mt-4">
                            We process your code temporarily and in-memory. Your source code is never stored permanently on our
                            servers. For more details, see our{" "}
                            <a href="/privacy" className="text-primary hover:underline">
                                Privacy Policy
                            </a>
                            .
                        </p>
                    </section>

                    {/* 9. Modification of Terms */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">9. Modification of Terms</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            We reserve the right to modify these Terms at any time. We will notify users of material changes via:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                            <li>Email notification to your registered address</li>
                            <li>In-app notification when you next log in</li>
                            <li>Updates to this page with a new "Last Updated" date</li>
                        </ul>
                        <p className="text-foreground/80 leading-relaxed mt-4">
                            Continued use of the Service after changes constitutes acceptance of the new Terms. If you disagree with
                            the changes, you must discontinue use of the Service.
                        </p>
                    </section>

                    {/* 10. Account Termination */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">10. Account Termination</h2>
                        <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-foreground">By You</h3>
                            <p className="text-foreground/80 leading-relaxed">
                                You may terminate your account at any time through your account settings or by contacting us. Upon
                                termination, we will delete your account data in accordance with our Privacy Policy.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-foreground">By Us</h3>
                            <p className="text-foreground/80 leading-relaxed">
                                We may suspend or terminate your account immediately, without prior notice, for:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                                <li>Violation of these Terms or our Privacy Policy</li>
                                <li>Fraudulent, abusive, or illegal activity</li>
                                <li>Non-payment of fees (for paid plans)</li>
                                <li>Extended inactivity (after reasonable notice)</li>
                                <li>Security concerns or suspected account compromise</li>
                            </ul>
                        </div>
                    </section>

                    {/* 11. Limitation of Liability */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">11. Limitation of Liability</h2>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 space-y-3">
                            <p className="text-foreground/80 leading-relaxed">
                                TO THE MAXIMUM EXTENT PERMITTED BY LAW, AEGLYN SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                                <li>Loss of profits, data, or business opportunities</li>
                                <li>Security breaches resulting from undetected vulnerabilities</li>
                                <li>Damages from reliance on AI-generated security insights</li>
                                <li>Service interruptions, downtime, or data loss</li>
                                <li>Third-party actions (including GitHub service issues)</li>
                            </ul>
                            <p className="text-foreground/80 leading-relaxed mt-3">
                                OUR TOTAL LIABILITY FOR ANY CLAIMS RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN
                                THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR $100 USD, WHICHEVER IS GREATER.
                            </p>
                        </div>
                        <p className="text-foreground/80 leading-relaxed">
                            This limitation applies even if we have been advised of the possibility of such damages. Some
                            jurisdictions do not allow certain liability exclusions, so some of the above may not apply to you.
                        </p>
                    </section>

                    {/* 12. Indemnification */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">12. Indemnification</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            You agree to indemnify, defend, and hold harmless Aeglyn, its officers, directors, employees, and agents
                            from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                            <li>Your use or misuse of the Service</li>
                            <li>Violation of these Terms or applicable laws</li>
                            <li>Infringement of third-party rights</li>
                            <li>Your code, repositories, or content processed through the Service</li>
                            <li>Unauthorized access to accounts or repositories</li>
                        </ul>
                    </section>

                    {/* 13. Governing Law and Dispute Resolution */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">13. Governing Law and Dispute Resolution</h2>
                        <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-foreground">Governing Law</h3>
                            <p className="text-foreground/80 leading-relaxed">
                                These Terms shall be governed by and construed in accordance with the laws of India, without regard to
                                its conflict of law provisions.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-foreground">Dispute Resolution</h3>
                            <p className="text-foreground/80 leading-relaxed">
                                In the event of any dispute arising from these Terms or the Service:
                            </p>
                            <ol className="list-decimal list-inside space-y-2 text-foreground/80 ml-4">
                                <li>
                                    <strong>Informal Resolution:</strong> Contact us at{" "}
                                    <a href="mailto:legal@aeglyn.site" className="text-primary hover:underline">
                                        legal@aeglyn.site
                                    </a>{" "}
                                    to attempt good-faith resolution
                                </li>
                                <li>
                                    <strong>Mediation:</strong> If informal resolution fails, both parties agree to attempt mediation
                                </li>
                                <li>
                                    <strong>Arbitration:</strong> Unresolved disputes shall be settled by binding arbitration in accordance
                                    with the Arbitration and Conciliation Act, 1996
                                </li>
                            </ol>
                            <p className="text-foreground/80 leading-relaxed mt-3">
                                You agree to waive any right to a jury trial or to participate in a class action lawsuit.
                            </p>
                        </div>
                    </section>

                    {/* 14. Miscellaneous */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">14. Miscellaneous</h2>
                        <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                            <li>
                                <strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions remain
                                in effect
                            </li>
                            <li>
                                <strong>Waiver:</strong> Failure to enforce any right does not constitute a waiver of that right
                            </li>
                            <li>
                                <strong>Assignment:</strong> You may not assign these Terms without our consent; we may assign freely
                            </li>
                            <li>
                                <strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and Aeglyn
                            </li>
                            <li>
                                <strong>Force Majeure:</strong> We are not liable for delays due to circumstances beyond our control
                            </li>
                        </ul>
                    </section>

                    {/* 15. Contact Information */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">15. Contact Information</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            For questions, concerns, or notices regarding these Terms of Service, please contact us:
                        </p>
                        <div className="bg-muted/50 rounded-lg p-6 space-y-2">
                            <p className="text-foreground">
                                <strong>Email:</strong>{" "}
                                <a href="mailto:legal@aeglyn.site" className="text-primary hover:underline">
                                    legal@aeglyn.site
                                </a>
                            </p>
                            <p className="text-foreground">
                                <strong>Support:</strong>{" "}
                                <a href="mailto:support@aeglyn.site" className="text-primary hover:underline">
                                    support@aeglyn.site
                                </a>
                            </p>
                            <p className="text-foreground">
                                <strong>Website:</strong>{" "}
                                <a href="https://aeglyn.site" className="text-primary hover:underline">
                                    https://aeglyn.site
                                </a>
                            </p>
                        </div>
                    </section>

                    {/* Footer Note */}
                    <div className="border-t border-border pt-8 mt-12">
                        <p className="text-sm text-muted-foreground text-center">
                            By using Aeglyn's privacy-first code security platform, you acknowledge that you have read, understood,
                            and agree to be bound by these Terms of Service.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
