'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getEducation, type EducationalContent } from '@/lib/education';

interface EducationPanelProps {
    vulnerabilityType: string;
    isSimpleMode?: boolean;
}

export function EducationPanel({ vulnerabilityType, isSimpleMode = true }: EducationPanelProps) {
    const [content, setContent] = useState<EducationalContent | null>(null);
    const [mode, setMode] = useState<'simple' | 'technical'>(isSimpleMode ? 'simple' : 'technical');
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const edu = getEducation(vulnerabilityType);
        setContent(edu);
    }, [vulnerabilityType]);

    if (!content) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                marginTop: '0.75rem',
                overflow: 'hidden'
            }}
        >
            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    padding: '0.75rem',
                    cursor: 'pointer'
                }}
            >
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>
                    📚 Learn More: {content.title}
                </span>
                <span style={{ color: 'var(--primary)' }}>{expanded ? '−' : '+'}</span>
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ padding: '1rem' }}>
                            {/* Mode Toggle */}
                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                marginBottom: '1rem'
                            }}>
                                <button
                                    onClick={() => setMode('simple')}
                                    style={{
                                        padding: '0.25rem 0.75rem',
                                        fontSize: '0.625rem',
                                        background: mode === 'simple' ? 'var(--primary)' : 'transparent',
                                        color: mode === 'simple' ? '#fff' : 'var(--primary)',
                                        border: '1px solid var(--primary)',
                                        borderRadius: '0.25rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    🎯 Simple
                                </button>
                                <button
                                    onClick={() => setMode('technical')}
                                    style={{
                                        padding: '0.25rem 0.75rem',
                                        fontSize: '0.625rem',
                                        background: mode === 'technical' ? 'var(--primary)' : 'transparent',
                                        color: mode === 'technical' ? '#fff' : 'var(--primary)',
                                        border: '1px solid var(--primary)',
                                        borderRadius: '0.25rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ⚙️ Technical
                                </button>
                            </div>

                            {/* Content */}
                            {mode === 'simple' ? (
                                <div>
                                    <p style={{ fontSize: '0.8125rem', color: '#e0e0e0', marginBottom: '0.75rem' }}>
                                        💡 {content.simple.summary}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '0.75rem' }}>
                                        🎭 <strong>Analogy:</strong> {content.simple.analogy}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: '#ff6666' }}>
                                        ⚠️ <strong>Risk:</strong> {content.simple.risk}
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: '#e0e0e0', marginBottom: '0.75rem' }}>
                                        {content.technical.description}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: '#ff9999', marginBottom: '0.75rem' }}>
                                        🎯 <strong>Attack:</strong> {content.technical.attack}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: '#ff6666' }}>
                                        💥 <strong>Impact:</strong> {content.technical.impact}
                                    </p>
                                </div>
                            )}

                            {/* Code Examples */}
                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ fontSize: '0.625rem', color: '#ff5555', marginBottom: '0.5rem' }}>
                                    ❌ VULNERABLE CODE
                                </div>
                                <pre style={{
                                    background: 'rgba(255, 0, 85, 0.1)',
                                    border: '1px solid rgba(255, 0, 85, 0.3)',
                                    borderRadius: '0.25rem',
                                    padding: '0.5rem',
                                    fontSize: '0.625rem',
                                    overflow: 'auto',
                                    color: '#e0e0e0'
                                }}>
                                    {content.examples.vulnerable}
                                </pre>

                                <div style={{ fontSize: '0.625rem', color: 'var(--primary)', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                                    ✅ SECURE CODE
                                </div>
                                <pre style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    borderRadius: '0.25rem',
                                    padding: '0.5rem',
                                    fontSize: '0.625rem',
                                    overflow: 'auto',
                                    color: '#e0e0e0'
                                }}>
                                    {content.examples.secure}
                                </pre>
                            </div>

                            {/* Quick Fix Steps */}
                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ fontSize: '0.625rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                                    ⚡ QUICK FIX STEPS
                                </div>
                                <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.6875rem', color: '#aaa' }}>
                                    {content.quickFix.map((step, i) => (
                                        <li key={i} style={{ marginBottom: '0.25rem' }}>{step}</li>
                                    ))}
                                </ol>
                            </div>

                            {/* Resources */}
                            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <div style={{ fontSize: '0.625rem', color: '#888', marginBottom: '0.5rem' }}>
                                    📖 LEARN MORE
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {content.resources.map((r, i) => (
                                        <a
                                            key={i}
                                            href={r.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                fontSize: '0.625rem',
                                                color: 'var(--primary)',
                                                textDecoration: 'none',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.25rem'
                                            }}
                                        >
                                            {r.title} ↗
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
