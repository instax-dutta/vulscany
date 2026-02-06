import type { Metadata } from "next"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"

export const metadata: Metadata = {
    title: "Privacy Policy | Aeglyn - Privacy-First Code Security",
    description: "Aeglyn's Privacy Policy: Learn how our privacy-first developer tool handles GitHub OAuth security, what data we collect, and what we never store. GDPR-compliant code scanning.",
    keywords: [
        "zero-log AI vulnerability scanner 2026",
        "GDPR compliant AI vulnerability detection",
        "zero-knowledge AI app sec pipeline",
        "offline AI code scanner no data upload",
        "real-time AI code security no logging",
        "privacy-first SAST AI tool",
        "vibe coders privacy",
        "Aeglyn privacy",
    ],
    openGraph: {
        title: "Privacy Policy | Aeglyn",
        description: "Privacy-first code scanning: what we collect, what we don't store, and your GDPR rights",
        url: "https://aeglyn.site/privacy",
    },
}

export default function PrivacyPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-8">
                        {/* Header */}
                        <div className="space-y-4 border-b border-border pb-8">
                            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
                                Privacy Policy
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Last Updated: January 18, 2026
                            </p>
                            <p className="text-foreground/80 leading-relaxed">
                                At Aeglyn, privacy isn't just a feature—it's our foundation. This Privacy Policy explains how our
                                privacy-first code security platform collects, uses, and protects your data when you use our
                                AI vulnerability scanner and developer tools.
                            </p>
                        </div>

                        {/* Privacy Promise */}
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 space-y-3">
                            <h2 className="text-2xl font-bold text-foreground">Our Privacy Promise</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                We built Aeglyn for developers who care about security <em>and</em> privacy. We process your code
                                temporarily to provide vulnerability scanning, but we <strong>never store your source code</strong>
                                permanently. Your code is yours, and it stays yours.
                            </p>
                        </div>

                        {/* 1. Data Controller Information */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">1. Data Controller Information</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                Aeglyn ("we", "us", or "our") is the data controller responsible for your personal information. For
                                privacy-related inquiries, contact us at:
                            </p>
                            <div className="bg-muted/50 rounded-lg p-6 space-y-2">
                                <p className="text-foreground">
                                    <strong>Privacy Contact:</strong>{" "}
                                    <a href="mailto:privacy@aeglyn.site" className="text-primary hover:underline">
                                        privacy@aeglyn.site
                                    </a>
                                </p>
                                <p className="text-foreground">
                                    <strong>Data Protection Officer:</strong>{" "}
                                    <a href="mailto:dpo@aeglyn.site" className="text-primary hover:underline">
                                        dpo@aeglyn.site
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

                        {/* 2. What Data We Collect */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">2. What Data We Collect</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                Our privacy-first developer tool collects minimal data necessary to provide our code security platform:
                            </p>

                            <div className="space-y-4">
                                <div className="border border-border rounded-lg p-5 space-y-2">
                                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                        <span className="text-green-500">✓</span> Account Information
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1 text-foreground/80 ml-6">
                                        <li>GitHub username and profile information (via OAuth)</li>
                                        <li>Email address (from GitHub or provided separately)</li>
                                        <li>Account creation and last login timestamps</li>
                                        <li>Subscription tier and billing information (for paid plans)</li>
                                    </ul>
                                </div>

                                <div className="border border-border rounded-lg p-5 space-y-2">
                                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                        <span className="text-green-500">✓</span> GitHub OAuth Security Data
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1 text-foreground/80 ml-6">
                                        <li>OAuth access tokens (encrypted and stored securely)</li>
                                        <li>Repository access permissions you grant us</li>
                                        <li>GitHub user ID and organization memberships</li>
                                        <li>Token expiration and refresh data</li>
                                    </ul>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        <strong>Note:</strong> OAuth tokens are encrypted at rest and in transit. We never log or expose
                                        these tokens in plain text.
                                    </p>
                                </div>

                                <div className="border border-border rounded-lg p-5 space-y-2">
                                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                        <span className="text-green-500">✓</span> Repository Metadata
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1 text-foreground/80 ml-6">
                                        <li>Repository names, descriptions, and languages</li>
                                        <li>Repository visibility (public/private)</li>
                                        <li>File paths and directory structures (not file contents)</li>
                                        <li>Commit hashes and branch names for scanned versions</li>
                                        <li>Repository size and last updated timestamps</li>
                                    </ul>
                                </div>

                                <div className="border border-border rounded-lg p-5 space-y-2">
                                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                        <span className="text-green-500">✓</span> Scan Results and Metadata
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1 text-foreground/80 ml-6">
                                        <li>Vulnerability findings (type, severity, location)</li>
                                        <li>AI-generated explanations and remediation suggestions</li>
                                        <li>Scan timestamps and duration</li>
                                        <li>Historical scan trends and statistics</li>
                                        <li>User actions on findings (dismissed, resolved, etc.)</li>
                                    </ul>
                                </div>

                                <div className="border border-border rounded-lg p-5 space-y-2">
                                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                        <span className="text-green-500">✓</span> Usage and Analytics Data
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1 text-foreground/80 ml-6">
                                        <li>Feature usage patterns (which tools you use most)</li>
                                        <li>API request counts and rate limit tracking</li>
                                        <li>Error logs and debugging information (anonymized)</li>
                                        <li>Performance metrics (scan speed, response times)</li>
                                        <li>Browser type, device type, and general location (country-level)</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 3. What We DON'T Store */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">3. What We DON'T Store</h2>
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 space-y-3">
                                <p className="text-foreground/80 leading-relaxed">
                                    This is what makes us a <strong>Zero-Log AI Vulnerability Scanner 2026</strong> with a <strong>Zero-Knowledge AI app sec pipeline</strong>:
                                </p>
                                <ul className="space-y-2 text-foreground/80">
                                    <li className="flex items-start gap-3">
                                        <span className="text-red-500 text-xl">✗</span>
                                        <span>
                                            <strong>Your Source Code (Offline processing):</strong> We process your code in-memory during scans but never store it
                                            permanently. Our <strong>offline AI code scanner</strong> ensures no file ever persists on our cloud. Once the scan completes, your code is immediately discarded.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-red-500 text-xl">✗</span>
                                        <span>
                                            <strong>AI Prompts or Queries:</strong> We don't log the specific code snippets sent to our AI
                                            models for analysis.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-red-500 text-xl">✗</span>
                                        <span>
                                            <strong>OAuth Tokens Long-Term:</strong> Tokens are encrypted and rotated regularly. When you
                                            revoke access or delete your account, tokens are immediately invalidated.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-red-500 text-xl">✗</span>
                                        <span>
                                            <strong>Secrets or Credentials:</strong> If our scanner detects API keys, passwords, or tokens in
                                            your code, we alert you but never store the actual secret values.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-red-500 text-xl">✗</span>
                                        <span>
                                            <strong>Unnecessary Personal Data:</strong> We don't collect browsing history, social media
                                            activity, or any data unrelated to providing our code security service.
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* 4. How We Use Your Data */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">4. How We Use Your Data</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                We use collected data exclusively to provide and improve our AI vulnerability scanner:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                                <li>
                                    <strong>Service Delivery:</strong> Authenticate users, scan repositories, generate vulnerability
                                    reports, and provide AI-powered security insights
                                </li>
                                <li>
                                    <strong>Security:</strong> Detect and prevent fraud, abuse, and unauthorized access
                                </li>
                                <li>
                                    <strong>Communication:</strong> Send scan results, security alerts, and important service updates
                                </li>
                                <li>
                                    <strong>Improvement:</strong> Analyze usage patterns to enhance our AI models and developer tools
                                </li>
                                <li>
                                    <strong>Compliance:</strong> Meet legal obligations and respond to lawful requests
                                </li>
                                <li>
                                    <strong>Support:</strong> Respond to your questions and troubleshoot issues
                                </li>
                            </ul>
                            <p className="text-foreground/80 leading-relaxed mt-4">
                                We <strong>never</strong> sell your data to third parties or use it for advertising purposes.
                            </p>
                        </section>

                        {/* 5. GitHub API Integration */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">5. GitHub API Integration</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                Our GitHub OAuth security integration is central to how Aeglyn works:
                            </p>
                            <div className="space-y-3">
                                <h3 className="text-xl font-semibold text-foreground">OAuth Permissions</h3>
                                <p className="text-foreground/80 leading-relaxed">
                                    When you connect your GitHub account, we request the following permissions:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                                    <li><code className="text-primary">repo</code> - Read access to your repositories for scanning</li>
                                    <li><code className="text-primary">user:email</code> - Access to your email for account management</li>
                                    <li><code className="text-primary">read:org</code> - Read organization membership (for team features)</li>
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xl font-semibold text-foreground">GitHub API Usage</h3>
                                <p className="text-foreground/80 leading-relaxed">
                                    We use GitHub's API to:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                                    <li>Fetch repository contents temporarily for vulnerability scanning</li>
                                    <li>Read repository metadata and file structures</li>
                                    <li>Access commit history for tracking scan coverage</li>
                                    <li>Verify repository access permissions</li>
                                </ul>
                                <p className="text-foreground/80 leading-relaxed mt-3">
                                    All GitHub API requests are made on your behalf using your OAuth token. We comply with GitHub's API
                                    terms and rate limits.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xl font-semibold text-foreground">Revoking Access</h3>
                                <p className="text-foreground/80 leading-relaxed">
                                    You can revoke Aeglyn's access to your GitHub account at any time:
                                </p>
                                <ol className="list-decimal list-inside space-y-2 text-foreground/80 ml-4">
                                    <li>Go to GitHub Settings → Applications → Authorized OAuth Apps</li>
                                    <li>Find "Aeglyn" and click "Revoke"</li>
                                    <li>Alternatively, disconnect from your Aeglyn account settings</li>
                                </ol>
                                <p className="text-foreground/80 leading-relaxed mt-3">
                                    Revoking access will prevent future scans but won't delete your Aeglyn account or historical scan
                                    results. To delete all data, see Section 9.
                                </p>
                            </div>
                        </section>

                        {/* 6. Data Retention */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">6. Data Retention</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                We retain data only as long as necessary for our privacy-first developer tool to function:
                            </p>
                            <div className="space-y-3">
                                <table className="w-full border border-border rounded-lg overflow-hidden">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="text-left p-4 font-semibold">Data Type</th>
                                            <th className="text-left p-4 font-semibold">Retention Period</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        <tr>
                                            <td className="p-4">Source Code</td>
                                            <td className="p-4 text-foreground/80">
                                                <strong className="text-green-500">0 seconds</strong> - Processed in-memory only
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-4">OAuth Tokens</td>
                                            <td className="p-4 text-foreground/80">Until revoked or account deleted</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4">Scan Results</td>
                                            <td className="p-4 text-foreground/80">Until you delete them or close your account</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4">Account Data</td>
                                            <td className="p-4 text-foreground/80">Until account deletion + 30 days for backups</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4">Usage Analytics</td>
                                            <td className="p-4 text-foreground/80">Aggregated data retained indefinitely (anonymized)</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4">Error Logs</td>
                                            <td className="p-4 text-foreground/80">90 days (anonymized after 30 days)</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* 7. GDPR and Your Rights */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">7. GDPR and Your Rights</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                Aeglyn is GDPR-compliant. If you're in the EU/EEA, you have the following rights:
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="border border-border rounded-lg p-4 space-y-2">
                                    <h3 className="font-semibold text-foreground">Right to Access</h3>
                                    <p className="text-sm text-foreground/80">
                                        Request a copy of all personal data we hold about you
                                    </p>
                                </div>
                                <div className="border border-border rounded-lg p-4 space-y-2">
                                    <h3 className="font-semibold text-foreground">Right to Rectification</h3>
                                    <p className="text-sm text-foreground/80">
                                        Correct inaccurate or incomplete data
                                    </p>
                                </div>
                                <div className="border border-border rounded-lg p-4 space-y-2">
                                    <h3 className="font-semibold text-foreground">Right to Erasure</h3>
                                    <p className="text-sm text-foreground/80">
                                        Request deletion of your personal data ("right to be forgotten")
                                    </p>
                                </div>
                                <div className="border border-border rounded-lg p-4 space-y-2">
                                    <h3 className="font-semibold text-foreground">Right to Restriction</h3>
                                    <p className="text-sm text-foreground/80">
                                        Limit how we process your data
                                    </p>
                                </div>
                                <div className="border border-border rounded-lg p-4 space-y-2">
                                    <h3 className="font-semibold text-foreground">Right to Portability</h3>
                                    <p className="text-sm text-foreground/80">
                                        Receive your data in a machine-readable format
                                    </p>
                                </div>
                                <div className="border border-border rounded-lg p-4 space-y-2">
                                    <h3 className="font-semibold text-foreground">Right to Object</h3>
                                    <p className="text-sm text-foreground/80">
                                        Object to processing based on legitimate interests
                                    </p>
                                </div>
                            </div>
                            <p className="text-foreground/80 leading-relaxed mt-4">
                                To exercise any of these rights, contact us at{" "}
                                <a href="mailto:privacy@aeglyn.site" className="text-primary hover:underline">
                                    privacy@aeglyn.site
                                </a>
                                . We'll respond within 30 days.
                            </p>
                        </section>

                        {/* 8. Data Security */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">8. Data Security</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                Security is at the core of our code security platform. We protect your data with:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                                <li>
                                    <strong>Encryption:</strong> All data encrypted in transit (TLS 1.3) and at rest (AES-256)
                                </li>
                                <li>
                                    <strong>Token Security:</strong> OAuth tokens encrypted with separate keys, rotated regularly
                                </li>
                                <li>
                                    <strong>Access Controls:</strong> Role-based access, principle of least privilege
                                </li>
                                <li>
                                    <strong>Infrastructure:</strong> Hosted on secure, SOC 2 compliant cloud providers
                                </li>
                                <li>
                                    <strong>Monitoring:</strong> 24/7 security monitoring and intrusion detection
                                </li>
                                <li>
                                    <strong>Audits:</strong> Regular security audits and penetration testing
                                </li>
                                <li>
                                    <strong>Incident Response:</strong> Documented procedures for security breaches
                                </li>
                            </ul>
                            <p className="text-foreground/80 leading-relaxed mt-4">
                                While we implement industry-standard security measures, no system is 100% secure. If you discover a
                                security vulnerability, please report it responsibly to{" "}
                                <a href="mailto:security@aeglyn.site" className="text-primary hover:underline">
                                    security@aeglyn.site
                                </a>
                                .
                            </p>
                        </section>

                        {/* 9. Third-Party Services */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">9. Third-Party Services</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                Aeglyn integrates with select third-party services to provide our AI vulnerability scanner:
                            </p>
                            <div className="space-y-3">
                                <div className="border border-border rounded-lg p-4">
                                    <h3 className="font-semibold text-foreground mb-2">GitHub</h3>
                                    <p className="text-sm text-foreground/80">
                                        For OAuth authentication and repository access. See{" "}
                                        <a
                                            href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
                                            className="text-primary hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            GitHub's Privacy Policy
                                        </a>
                                        .
                                    </p>
                                </div>
                                <div className="border border-border rounded-lg p-4">
                                    <h3 className="font-semibold text-foreground mb-2">Cloud Infrastructure</h3>
                                    <p className="text-sm text-foreground/80">
                                        We use secure cloud providers for hosting and data storage. All providers are SOC 2 compliant and
                                        GDPR-ready.
                                    </p>
                                </div>
                                <div className="border border-border rounded-lg p-4">
                                    <h3 className="font-semibold text-foreground mb-2">AI Model Providers</h3>
                                    <p className="text-sm text-foreground/80">
                                        Our AI models may use third-party inference APIs. Code snippets sent to AI providers are anonymized
                                        and not stored by them.
                                    </p>
                                </div>
                                <div className="border border-border rounded-lg p-4">
                                    <h3 className="font-semibold text-foreground mb-2">Analytics</h3>
                                    <p className="text-sm text-foreground/80">
                                        We use privacy-focused analytics (no cookies, no tracking across sites) to understand feature usage
                                        and improve our developer tool.
                                    </p>
                                </div>
                            </div>
                            <p className="text-foreground/80 leading-relaxed mt-4">
                                We carefully vet all third-party services and ensure they meet our privacy standards. We never share
                                your source code with third parties.
                            </p>
                        </section>

                        {/* 10. Cookies and Tracking */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">10. Cookies and Tracking</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                As a privacy-first developer tool, we minimize cookie usage:
                            </p>
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-foreground">Essential Cookies</h3>
                                <p className="text-foreground/80 leading-relaxed">
                                    Required for authentication and basic functionality:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-foreground/80 ml-4">
                                    <li>Session cookies (expire when you close your browser)</li>
                                    <li>Authentication tokens (encrypted, httpOnly, secure)</li>
                                    <li>CSRF protection tokens</li>
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-foreground">Analytics Cookies</h3>
                                <p className="text-foreground/80 leading-relaxed">
                                    We use minimal, privacy-focused analytics:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-foreground/80 ml-4">
                                    <li>No third-party tracking (no Google Analytics, Facebook Pixel, etc.)</li>
                                    <li>No cross-site tracking or fingerprinting</li>
                                    <li>Aggregated, anonymized usage data only</li>
                                </ul>
                            </div>
                            <p className="text-foreground/80 leading-relaxed mt-4">
                                You can disable cookies in your browser settings, but this may affect functionality.
                            </p>
                        </section>

                        {/* 11. Children's Privacy */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">11. Children's Privacy</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                Aeglyn is not intended for users under 18. We do not knowingly collect data from children. If you
                                believe we've inadvertently collected data from a minor, contact us immediately at{" "}
                                <a href="mailto:privacy@aeglyn.site" className="text-primary hover:underline">
                                    privacy@aeglyn.site
                                </a>
                                , and we'll delete it promptly.
                            </p>
                        </section>

                        {/* 12. International Data Transfers */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">12. International Data Transfers</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                Aeglyn operates globally. Your data may be transferred to and processed in countries other than your own.
                                We ensure adequate protection through:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                                <li>Standard Contractual Clauses (SCCs) for EU data transfers</li>
                                <li>GDPR-compliant data processing agreements with all vendors</li>
                                <li>Encryption in transit and at rest for all cross-border transfers</li>
                                <li>Regular compliance audits and certifications</li>
                            </ul>
                        </section>

                        {/* 13. Changes to This Privacy Policy */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">13. Changes to This Privacy Policy</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                We may update this Privacy Policy to reflect changes in our practices or legal requirements. We'll notify
                                you of material changes via:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                                <li>Email notification to your registered address</li>
                                <li>In-app notification when you next log in</li>
                                <li>Updates to this page with a new "Last Updated" date</li>
                            </ul>
                            <p className="text-foreground/80 leading-relaxed mt-4">
                                Continued use of Aeglyn after changes constitutes acceptance of the updated Privacy Policy. We encourage
                                you to review this page periodically.
                            </p>
                        </section>

                        {/* 14. Contact for Data Requests */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">14. Contact for Data Requests</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                To exercise your privacy rights or request data deletion, contact us:
                            </p>
                            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Data Access Request</h3>
                                    <p className="text-foreground/80">
                                        Email{" "}
                                        <a href="mailto:privacy@aeglyn.site" className="text-primary hover:underline">
                                            privacy@aeglyn.site
                                        </a>{" "}
                                        with subject "Data Access Request"
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Data Deletion Request</h3>
                                    <p className="text-foreground/80">
                                        Email{" "}
                                        <a href="mailto:privacy@aeglyn.site" className="text-primary hover:underline">
                                            privacy@aeglyn.site
                                        </a>{" "}
                                        with subject "Data Deletion Request" or delete your account in settings
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">GDPR Complaints</h3>
                                    <p className="text-foreground/80">
                                        Contact our Data Protection Officer at{" "}
                                        <a href="mailto:dpo@aeglyn.site" className="text-primary hover:underline">
                                            dpo@aeglyn.site
                                        </a>
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">General Privacy Questions</h3>
                                    <p className="text-foreground/80">
                                        Email{" "}
                                        <a href="mailto:support@aeglyn.site" className="text-primary hover:underline">
                                            support@aeglyn.site
                                        </a>
                                    </p>
                                </div>
                            </div>
                            <p className="text-foreground/80 leading-relaxed mt-4">
                                We'll respond to all requests within 30 days. For urgent matters, please mark your email as "Urgent."
                            </p>
                        </section>

                        {/* 15. Your Privacy Controls */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">15. Your Privacy Controls</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                You have full control over your data in Aeglyn:
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="border border-border rounded-lg p-4 space-y-2">
                                    <h3 className="font-semibold text-foreground">Account Settings</h3>
                                    <p className="text-sm text-foreground/80">
                                        Update your profile, email preferences, and notification settings
                                    </p>
                                </div>
                                <div className="border border-border rounded-lg p-4 space-y-2">
                                    <h3 className="font-semibold text-foreground">Repository Access</h3>
                                    <p className="text-sm text-foreground/80">
                                        Choose which repositories Aeglyn can scan
                                    </p>
                                </div>
                                <div className="border border-border rounded-lg p-4 space-y-2">
                                    <h3 className="font-semibold text-foreground">Scan History</h3>
                                    <p className="text-sm text-foreground/80">
                                        View and delete individual scan results
                                    </p>
                                </div>
                                <div className="border border-border rounded-lg p-4 space-y-2">
                                    <h3 className="font-semibold text-foreground">Data Export</h3>
                                    <p className="text-sm text-foreground/80">
                                        Download all your data in JSON format
                                    </p>
                                </div>
                                <div className="border border-border rounded-lg p-4 space-y-2">
                                    <h3 className="font-semibold text-foreground">OAuth Management</h3>
                                    <p className="text-sm text-foreground/80">
                                        Revoke GitHub access at any time
                                    </p>
                                </div>
                                <div className="border border-border rounded-lg p-4 space-y-2">
                                    <h3 className="font-semibold text-foreground">Account Deletion</h3>
                                    <p className="text-sm text-foreground/80">
                                        Permanently delete your account and all associated data
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Footer Note */}
                        <div className="border-t border-border pt-8 mt-12">
                            <p className="text-sm text-muted-foreground text-center">
                                At Aeglyn, we're committed to being the most privacy-first code security platform for developers.
                                Your code is yours, your data is protected, and your privacy is non-negotiable.
                            </p>
                            <p className="text-sm text-muted-foreground text-center mt-4">
                                Questions? Reach out to{" "}
                                <a href="mailto:privacy@aeglyn.site" className="text-primary hover:underline">
                                    privacy@aeglyn.site
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
