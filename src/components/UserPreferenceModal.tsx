/**
 * User Preference Modal - One-screen onboarding after GitHub OAuth
 * Asks user about their security expertise level
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface UserPreferenceModalProps {
    isOpen: boolean;
    onComplete: (mode: 'simple' | 'pro') => void;
}

export function UserPreferenceModal({ isOpen, onComplete }: UserPreferenceModalProps) {
    const [selectedMode, setSelectedMode] = useState<'simple' | 'pro' | null>(null);

    const handleSelect = (mode: 'simple' | 'pro') => {
        setSelectedMode(mode);
        // Store preference in localStorage
        localStorage.setItem('vulscany_user_mode', mode);
        localStorage.setItem('vulscany_onboarding_complete', 'true');

        // Delay to show selection animation
        setTimeout(() => {
            onComplete(mode);
        }, 800);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10001,
                    padding: '2rem'
                }}
            >
                <motion.div
                    initial={{ scale: 0.8, y: 50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.98), rgba(20, 20, 30, 0.98))',
                        border: '2px solid rgba(59, 130, 246, 0.5)',
                        borderRadius: '1.5rem',
                        padding: '3rem 2.5rem',
                        maxWidth: '600px',
                        width: '100%',
                        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(59, 130, 246, 0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Animated background gradient */}
                    <motion.div
                        animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.03), transparent)',
                            backgroundSize: '200% 100%',
                            pointerEvents: 'none'
                        }}
                    />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                                style={{ fontSize: '4rem', marginBottom: '1rem' }}
                            >
                                🛡️
                            </motion.div>
                            <h2 style={{
                                fontSize: '2rem',
                                fontWeight: '900',
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                fontFamily: 'var(--font-mono)',
                                marginBottom: '0.75rem'
                            }}>
                                Welcome to vulscany!
                            </h2>
                            <p style={{
                                fontSize: '1rem',
                                color: '#cbd5e1',
                                fontFamily: 'var(--font-mono)',
                                lineHeight: 1.6
                            }}>
                                How comfortable are you with code security?
                            </p>
                        </div>

                        {/* Mode Selection Cards */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1.25rem',
                            marginBottom: '2rem'
                        }}>
                            {/* Simple Mode */}
                            <motion.button
                                whileHover={{ scale: 1.03, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelect('simple')}
                                style={{
                                    background: selectedMode === 'simple'
                                        ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 204, 255, 0.2))'
                                        : 'rgba(26, 26, 36, 0.6)',
                                    border: selectedMode === 'simple'
                                        ? '2px solid #00ff88'
                                        : '2px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '1rem',
                                    padding: '2rem 1.5rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    textAlign: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {selectedMode === 'simple' && (
                                    <motion.div
                                        layoutId="selection"
                                        style={{
                                            position: 'absolute',
                                            inset: -2,
                                            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 204, 255, 0.1))',
                                            borderRadius: '1rem',
                                            zIndex: 0
                                        }}
                                    />
                                )}
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🌱</div>
                                    <div style={{
                                        fontSize: '1.125rem',
                                        fontWeight: '900',
                                        color: selectedMode === 'simple' ? '#00ff88' : '#fff',
                                        fontFamily: 'var(--font-mono)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Simple Mode
                                    </div>
                                    <div style={{
                                        fontSize: '0.8125rem',
                                        color: '#94a3b8',
                                        lineHeight: 1.5,
                                        fontFamily: 'var(--font-mono)'
                                    }}>
                                        "Explain like I'm 5"<br />Plain English, beginner-friendly
                                    </div>
                                </div>
                            </motion.button>

                            {/* Pro Mode */}
                            <motion.button
                                whileHover={{ scale: 1.03, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelect('pro')}
                                style={{
                                    background: selectedMode === 'pro'
                                        ? 'linear-gradient(135deg, rgba(255, 170, 0, 0.2), rgba(255, 85, 0, 0.2))'
                                        : 'rgba(26, 26, 36, 0.6)',
                                    border: selectedMode === 'pro'
                                        ? '2px solid #ffaa00'
                                        : '2px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '1rem',
                                    padding: '2rem 1.5rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    textAlign: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {selectedMode === 'pro' && (
                                    <motion.div
                                        layoutId="selection"
                                        style={{
                                            position: 'absolute',
                                            inset: -2,
                                            background: 'linear-gradient(135deg, rgba(255, 170, 0, 0.1), rgba(255, 85, 0, 0.1))',
                                            borderRadius: '1rem',
                                            zIndex: 0
                                        }}
                                    />
                                )}
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⚡</div>
                                    <div style={{
                                        fontSize: '1.125rem',
                                        fontWeight: '900',
                                        color: selectedMode === 'pro' ? '#ffaa00' : '#fff',
                                        fontFamily: 'var(--font-mono)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Pro Mode
                                    </div>
                                    <div style={{
                                        fontSize: '0.8125rem',
                                        color: '#94a3b8',
                                        lineHeight: 1.5,
                                        fontFamily: 'var(--font-mono)'
                                    }}>
                                        Technical details, CVEs,<br />attack vectors & MITRE
                                    </div>
                                </div>
                            </motion.button>
                        </div>

                        {/* Footer Note */}
                        <div style={{
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            color: '#64748b',
                            fontFamily: 'var(--font-mono)',
                            padding: '1rem',
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                            💡 Don't worry - you can change this anytime in settings
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Helper to check if onboarding is needed
export function shouldShowOnboarding(): boolean {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('vulscany_onboarding_complete');
}

// Get stored user mode
export function getUserMode(): 'simple' | 'pro' {
    if (typeof window === 'undefined') return 'simple';
    return (localStorage.getItem('vulscany_user_mode') as 'simple' | 'pro') || 'simple';
}
