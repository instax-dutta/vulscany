/**
 * Privacy Policy - VullScanny
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Lenis from '@studio-freight/lenis';

export default function PrivacyPolicy() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        return () => lenis.destroy();
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0f, #1a0a2e)', color: '#fff' }}>

            {/* Background Grid */}
            <div style={{
                position: 'fixed',
                inset: 0,
                backgroundImage: `linear-gradient(to right, rgba(0, 255, 136, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 255, 136, 0.03) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
                opacity: 0.3,
                pointerEvents: 'none'
            }} />

            {/* Header */}
            <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10, 10, 15, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '2px solid rgba(0, 255, 136, 0.2)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            background: 'linear-gradient(135deg, #00ff88, #00ccff)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>🛡️</div>
                        <span style={{ fontSize: '1.25rem', fontWeight: '900', background: 'linear-gradient(90deg, #00ff88, #00ccff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'monospace' }}>
                            VullScanny
                        </span>
                    </Link>
                    <Link href="/" style={{
                        background: 'rgba(0, 255, 136, 0.1)',
                        border: '2px solid #00ff88',
                        color: '#00ff88',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        textDecoration: 'none',
                        fontFamily: 'monospace'
                    }}>
                        ← Back to Home
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem', position: 'relative' }}>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Hero */}
                    <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'rgba(0, 255, 136, 0.1)',
                            border: '2px solid rgba(0, 255, 136, 0.3)',
                            borderRadius: '9999px',
                            padding: '0.5rem 1rem',
                            marginBottom: '1.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: '#00ff88'
                        }}>
                            <span>🔒</span> Privacy First
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: '900',
                            marginBottom: '1rem',
                            background: 'linear-gradient(90deg, #00ff88, #00ccff)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Privacy Policy
                        </h1>
                        <p style={{ fontSize: '1.125rem', color: '#9ca3af' }}>
                            How VullScanny protects your data
                        </p>
                    </div>

                    {/* TL;DR */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 204, 255, 0.05))',
                        border: '2px solid rgba(0, 255, 136, 0.3)',
                        borderRadius: '1rem',
                        padding: '2rem',
                        marginBottom: '3rem'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#00ff88', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>⚡</span> TL;DR
                        </h2>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#cbd5e1', lineHeight: 1.8, fontSize: '1rem' }}>
                            <li><strong style={{ color: '#00ff88' }}>Zero Storage:</strong> Your code is never stored on our servers</li>
                            <li><strong style={{ color: '#00ff88' }}>Temporary Access:</strong> OAuth tokens are session-only</li>
                            <li><strong style={{ color: '#00ff88' }}>Real-time Scanning:</strong> All analysis happens in memory</li>
                            <li><strong style={{ color: '#00ff88' }}>Read-Only:</strong> We only request read access to repositories</li>
                        </ul>
                    </div>

                    {/* Sections */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Section 1 */}
                        <div style={{
                            background: 'rgba(10, 10, 15, 0.6)',
                            border: '2px solid rgba(0, 255, 136, 0.2)',
                            borderRadius: '1rem',
                            padding: '2rem'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#00ff88', marginBottom: '1rem' }}>
                                1. What We Collect
                            </h2>
                            <div style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '1rem' }}>
                                <p style={{ marginBottom: '1rem' }}>
                                    <strong style={{ color: '#e4e4e7' }}>GitHub Profile Information:</strong>
                                </p>
                                <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                                    <li>Username</li>
                                    <li>Email address</li>
                                    <li>Profile picture</li>
                                    <li>Repository list (names only)</li>
                                </ul>
                                <p style={{ marginBottom: '1rem' }}>
                                    <strong style={{ color: '#e4e4e7' }}>During Scans:</strong>
                                </p>
                                <ul style={{ marginLeft: '1.5rem' }}>
                                    <li>package.json contents (to detect React)</li>
                                    <li>Source file contents (analyzed in memory)</li>
                                    <li>Scan results (temporarily, for display)</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div style={{
                            background: 'rgba(10, 10, 15, 0.6)',
                            border: '2px solid rgba(0, 204, 255, 0.2)',
                            borderRadius: '1rem',
                            padding: '2rem'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#00ccff', marginBottom: '1rem' }}>
                                2. What We DON'T Store
                            </h2>
                            <div style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '1rem' }}>
                                <ul style={{ marginLeft: '1.5rem' }}>
                                    <li>❌ Your source code</li>
                                    <li>❌ Repository contents</li>
                                    <li>❌ GitHub access tokens (beyond session)</li>
                                    <li>❌ Scan results (cleared on logout)</li>
                                    <li>❌ Personal files or documents</li>
                                    <li>❌ Any sensitive information</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 3 */}
                        <div style={{
                            background: 'rgba(10, 10, 15, 0.6)',
                            border: '2px solid rgba(0, 255, 136, 0.2)',
                            borderRadius: '1rem',
                            padding: '2rem'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#00ff88', marginBottom: '1rem' }}>
                                3. How We Use Data
                            </h2>
                            <div style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '1rem' }}>
                                <p style={{ marginBottom: '1rem' }}>
                                    We use collected data <strong style={{ color: '#e4e4e7' }}>only</strong> for:
                                </p>
                                <ul style={{ marginLeft: '1.5rem' }}>
                                    <li>Authenticating your GitHub account</li>
                                    <li>Fetching your repository list</li>
                                    <li>Scanning selected repositories for vulnerabilities</li>
                                    <li>Displaying scan results to you</li>
                                    <li>Generating AI-powered fix suggestions</li>
                                </ul>
                                <p style={{ marginTop: '1rem', color: '#9ca3af', fontSize: '0.9375rem' }}>
                                    All processing happens in real-time. Nothing is saved to disk.
                                </p>
                            </div>
                        </div>

                        {/* Section 4 */}
                        <div style={{
                            background: 'rgba(10, 10, 15, 0.6)',
                            border: '2px solid rgba(0, 204, 255, 0.2)',
                            borderRadius: '1rem',
                            padding: '2rem'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#00ccff', marginBottom: '1rem' }}>
                                4. Third-Party Services
                            </h2>
                            <div style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '1rem' }}>
                                <p style={{ marginBottom: '1rem' }}>We use the following services:</p>
                                <ul style={{ marginLeft: '1.5rem' }}>
                                    <li><strong style={{ color: '#e4e4e7' }}>GitHub API:</strong> For authentication and repository access</li>
                                    <li><strong style={{ color: '#e4e4e7' }}>AI Services:</strong> For vulnerability analysis (code snippets only, not full files)</li>
                                </ul>
                                <p style={{ marginTop: '1rem', color: '#9ca3af', fontSize: '0.9375rem' }}>
                                    These services have their own privacy policies. We send minimal data required for functionality.
                                </p>
                            </div>
                        </div>

                        {/* Section 5 */}
                        <div style={{
                            background: 'rgba(10, 10, 15, 0.6)',
                            border: '2px solid rgba(0, 255, 136, 0.2)',
                            borderRadius: '1rem',
                            padding: '2rem'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#00ff88', marginBottom: '1rem' }}>
                                5. Data Security
                            </h2>
                            <div style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '1rem' }}>
                                <ul style={{ marginLeft: '1.5rem' }}>
                                    <li>All connections use HTTPS encryption</li>
                                    <li>Tokens are stored in secure, HTTP-only cookies</li>
                                    <li>Session data expires after logout</li>
                                    <li>No persistent storage of sensitive information</li>
                                    <li>Regular security audits of our codebase</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 6 */}
                        <div style={{
                            background: 'rgba(10, 10, 15, 0.6)',
                            border: '2px solid rgba(0, 204, 255, 0.2)',
                            borderRadius: '1rem',
                            padding: '2rem'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#00ccff', marginBottom: '1rem' }}>
                                6. Your Rights
                            </h2>
                            <div style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '1rem' }}>
                                <p style={{ marginBottom: '1rem' }}>You have the right to:</p>
                                <ul style={{ marginLeft: '1.5rem' }}>
                                    <li>Disconnect your GitHub account at any time</li>
                                    <li>Revoke access via GitHub settings</li>
                                    <li>Request deletion of any stored data (minimal as it is)</li>
                                    <li>Know exactly what data we process</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 7 */}
                        <div style={{
                            background: 'rgba(10, 10, 15, 0.6)',
                            border: '2px solid rgba(0, 255, 136, 0.2)',
                            borderRadius: '1rem',
                            padding: '2rem'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#00ff88', marginBottom: '1rem' }}>
                                7. Contact
                            </h2>
                            <div style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '1rem' }}>
                                <p>
                                    Questions about privacy? Contact us at:{' '}
                                    <a href="mailto:contact@sdad.pro" style={{ color: '#00ff88', textDecoration: 'none' }}>
                                        contact@sdad.pro
                                    </a>
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Last Updated */}
                    <div style={{
                        marginTop: '3rem',
                        padding: '1.5rem',
                        background: 'rgba(0, 204, 255, 0.05)',
                        border: '1px solid rgba(0, 204, 255, 0.2)',
                        borderRadius: '0.75rem',
                        textAlign: 'center',
                        color: '#9ca3af',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace'
                    }}>
                        Last Updated: December 15, 2025
                    </div>

                    {/* CTA */}
                    <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                        <Link href="/" style={{
                            display: 'inline-block',
                            background: 'linear-gradient(135deg, #00ff88, #00ccff)',
                            border: 'none',
                            color: '#0a0a0f',
                            padding: '1rem 2rem',
                            borderRadius: '0.75rem',
                            fontSize: '1rem',
                            fontWeight: '700',
                            textDecoration: 'none',
                            boxShadow: '0 10px 40px rgba(0, 255, 136, 0.3)'
                        }}>
                            Start Scanning →
                        </Link>
                    </div>

                </motion.div>
            </main>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid rgba(0, 255, 136, 0.2)', marginTop: '4rem', padding: '2rem' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', color: '#666', fontSize: '0.875rem' }}>
                    <p>© 2025 VullScanny • Your Privacy Matters</p>
                </div>
            </footer>
        </div>
    );
}
