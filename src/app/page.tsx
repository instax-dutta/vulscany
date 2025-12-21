/**
 * VullScanny Landing Page - Clean & Modern
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Lenis from 'lenis';

export default function Home() {
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

  const handleGitHubLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '';
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/callback`);
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user repo`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0f, #1a0a2e)', color: '#fff', position: 'relative', overflow: 'hidden' }}>

      {/* Background Effects */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `linear-gradient(to right, rgba(0, 255, 136, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 255, 136, 0.03) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
        opacity: 0.3
      }} />

      <motion.div
        style={{
          position: 'fixed',
          top: '10%',
          right: '10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(0, 255, 136, 0.1), transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10, 10, 15, 0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0, 255, 136, 0.2)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
          </div>
          <Link href="/privacy" style={{ color: '#00ccff', fontSize: '0.875rem', textDecoration: 'none' }}>Privacy</Link>
        </div>
      </header>

      {/* Announcement Banner */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        style={{
          background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.15), rgba(0, 204, 255, 0.15))',
          borderBottom: '2px solid rgba(0, 255, 136, 0.3)',
          padding: '1rem 2rem',
          position: 'relative',
          zIndex: 99
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: '1.5rem' }}
          >
            🚀
          </motion.div>
          <div style={{ flex: 1, minWidth: '300px', textAlign: 'center' }}>
            <span style={{ fontWeight: '900', color: '#00ff88', fontFamily: 'monospace', fontSize: '0.875rem' }}>
              NEW:
            </span>
            <span style={{ color: '#cbd5e1', marginLeft: '0.5rem', fontSize: '0.875rem' }}>
              Advanced Threat Intelligence • Real-time CVE Tracking • Zero-Day Detection
            </span>
          </div>
          <motion.button
            onClick={handleGitHubLogin}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'linear-gradient(135deg, #00ff88, #00ccff)',
              color: '#0a0a0f',
              padding: '0.5rem 1.5rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap'
            }}
          >
            TRY NOW →
          </motion.button>
        </div>
      </motion.div>

      {/* Hero Section */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 2rem 4rem', position: 'relative' }}>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            textAlign: 'center',
            marginBottom: '6rem',
            minHeight: 'calc(100vh - 200px)', // Account for header + announcement banner
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '2rem'
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              borderRadius: '9999px',
              padding: '0.5rem 1.25rem',
              marginBottom: '2rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#00ff88'
            }}
          >
            <span>✓</span> Privacy-First Security Scanner
          </motion.div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: '900',
            marginBottom: '1.5rem',
            lineHeight: 1.1,
            letterSpacing: '-0.02em'
          }}>
            <span style={{ display: 'block', background: 'linear-gradient(90deg, #00ff88, #00ccff, #ff0055)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
              Scan React Apps
            </span>
            <span style={{ color: '#e4e4e7' }}>for Security Issues</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#cbd5e1',
            marginBottom: '2.5rem',
            maxWidth: '700px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6
          }}>
            <span style={{ color: '#00ff88', fontWeight: 'bold' }}>VulkanorAI</span>-powered vulnerability detection for your React projects. Your code is never stored, scans happen in real-time.
          </p>

          <motion.button
            onClick={handleGitHubLogin}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'linear-gradient(135deg, #00ff88, #00ccff)',
              border: 'none',
              color: '#0a0a0f',
              padding: '1rem 2.5rem',
              borderRadius: '0.75rem',
              fontSize: '1.125rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 20px 50px rgba(0, 255, 136, 0.2)', // Deeper glow
              fontFamily: 'system-ui, sans-serif'
            }}
          >
            Connect with GitHub →
          </motion.button>
        </motion.div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '5rem' }}>
          {[
            { icon: '🔍', title: 'Deep Scanning', desc: 'Detect XSS, injection, and React-specific vulnerabilities' },
            { icon: '🤖', title: 'VulkanorAI Analysis', desc: 'Get instant VulkanorAI-powered fix suggestions for each issue' },
            { icon: '🔒', title: 'Zero Storage', desc: 'Your code is never stored. Everything happens in real-time' },
            { icon: '⚡', title: 'Instant Results', desc: 'Scan multiple repositories in parallel with batch mode' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              style={{
                background: 'rgba(10, 10, 15, 0.6)',
                border: '2px solid rgba(0, 255, 136, 0.2)',
                borderRadius: '1rem',
                padding: '2rem',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#00ff88', marginBottom: '0.5rem' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '0.9375rem', color: '#9ca3af', lineHeight: 1.6 }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ marginTop: '6rem', textAlign: 'center' }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', marginBottom: '3rem', color: '#e4e4e7' }}>
            How It Works
          </h2>

          <div style={{ position: 'relative', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Connecting Line (Desktop) */}
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '10%',
              right: '10%',
              height: '2px',
              background: 'linear-gradient(90deg, #00ff88, #00ccff)',
              opacity: 0.3,
              zIndex: 0,
              display: 'none', // Hidden on mobile by default, shown via CSS check usually, but safely hidden for now or handled via Grid
            }} className="desktop-line" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', position: 'relative', zIndex: 1 }}>
              {[
                {
                  text: 'Connect GitHub',
                  path: 'M12 2C6.48 2 2 6.48 2 12c0 4.42 3 8.16 7.15 9.54.5.09.68-.22.68-.48l-.01-1.7c-2.92.63-3.54-1.41-3.54-1.41-.45-1.15-1.11-1.46-1.11-1.46-.95-.65.07-.64.07-.64 1.05.08 1.6 1.08 1.6 1.08.94 1.6 2.46 1.14 3.06.87.1-.68.37-1.14.67-1.4-2.33-.26-4.78-1.17-4.78-5.2 0-1.15.41-2.09 1.08-2.83-.11-.26-.47-1.34.1-2.79 0 0 .88-.28 2.88 1.07.84-.23 1.74-.35 2.64-.35.9 0 1.8.12 2.64.35 2 1.35 2.88 1.07 2.88 1.07.57 1.45.21 2.53.1 2.79.67.74 1.08 1.68 1.08 2.83 0 4.04-2.46 4.93-4.79 5.2.38.33.72.98.72 1.97l-.01 2.93c0 .27.18.57.69.48A10.005 10.005 0 0022 12c0-5.52-4.48-10-10-10z'
                },
                {
                  text: 'Select Repos',
                  path: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z'
                },
                {
                  text: 'Run Scan',
                  path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'
                },
                {
                  text: 'Get VulkanorAI Fixes',
                  path: 'M20 15.5c-1.25 0-2.45-.2-3.57-.59-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 1 0 0 1 .45 1h16c.55 0 1-.45 1-1s-.45-1-1-1z M12 3v10l3-3h6V3h-9z' // Generic spark/chat path
                }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, type: 'spring' }}
                  whileHover={{ y: -5 }}
                  style={{ position: 'relative' }}
                >
                  <motion.div
                    animate={{ boxShadow: ['0 0 0px rgba(0,255,136,0)', '0 0 20px rgba(0,255,136,0.3)', '0 0 0px rgba(0,255,136,0)'] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                    style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, rgba(10, 20, 30, 0.8), rgba(0, 20, 40, 0.8))',
                      border: '2px solid #00ff88',
                      borderRadius: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem',
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 5px rgba(0,255,136,0.5))' }}>
                      {i === 3 ? (
                        // Custom spark icon for VulkanorAI
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#grad1)" stroke="none" />
                      ) : (
                        // Fallback to path logic
                        <path d={step.path} fill="currentColor" stroke="none" opacity="0.9" />
                      )}
                      <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#00ff88" />
                          <stop offset="100%" stopColor="#00ccff" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#e4e4e7', marginBottom: '0.25rem' }}>
                    {step.text}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666', fontFamily: 'monospace' }}>
                    STEP 0{i + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            marginTop: '6rem',
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 204, 255, 0.1))',
            border: '2px solid rgba(0, 255, 136, 0.3)',
            borderRadius: '1.5rem',
            padding: '3rem 2rem',
            textAlign: 'center'
          }}
        >
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '900', marginBottom: '1rem', color: '#e4e4e7' }}>
            Ready to Secure Your React Apps?
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#9ca3af', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Start scanning in seconds. No credit card required.
          </p>
          <motion.button
            onClick={handleGitHubLogin}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'linear-gradient(135deg, #00ff88, #00ccff)',
              border: 'none',
              color: '#0a0a0f',
              padding: '1rem 2.5rem',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 10px 40px rgba(0, 255, 136, 0.3)'
            }}
          >
            Get Started Free
          </motion.button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(0, 255, 136, 0.2)', marginTop: '6rem', padding: '2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center', color: '#666', fontSize: '0.875rem' }}>
          <p>© 2025 VullScanny • Powered by <strong>VulkanorAI</strong> Engine</p>
          <div style={{ marginTop: '1rem' }}>
            <Link href="/privacy" style={{ color: '#00ccff', textDecoration: 'none' }}>Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
