/**
 * AI Fix Preview Modal - Syntax-highlighted code diff viewer
 * Shows before/after comparison with copy and test commands
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface AIFixPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    vulnerability: {
        title: string;
        file: string;
        snippet?: string;
        fixCode?: string;
    };
    repoName: string;
}

export function AIFixPreviewModal({ isOpen, onClose, vulnerability, repoName }: AIFixPreviewModalProps) {
    const [copied, setCopied] = useState(false);
    const [commandCopied, setCommandCopied] = useState(false);

    const handleCopyFix = () => {
        if (vulnerability.fixCode) {
            navigator.clipboard.writeText(vulnerability.fixCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handleCopyCommand = () => {
        const command = `npx aeglyn --test ${vulnerability.file}`;
        navigator.clipboard.writeText(command);
        setCommandCopied(true);
        setTimeout(() => setCommandCopied(false), 2500);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    padding: '2rem'
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 30, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: 20, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.98), rgba(15, 15, 25, 0.98))',
                        border: '2px solid rgba(0, 255, 136, 0.4)',
                        borderRadius: '1.5rem',
                        maxWidth: '900px',
                        width: '100%',
                        maxHeight: '85vh',
                        overflow: 'hidden',
                        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 255, 136, 0.1)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '1.5rem 2rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: '900',
                                color: '#00ff88',
                                fontFamily: 'var(--font-mono)',
                                marginBottom: '0.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <span>🔍</span>
                                Fix Preview
                            </div>
                            <div style={{
                                fontSize: '0.875rem',
                                color: '#64748b',
                                fontFamily: 'var(--font-mono)'
                            }}>
                                {vulnerability.file}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#94a3b8',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-mono)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                        >
                            ESC
                        </button>
                    </div>

                    {/* Code Diff Container */}
                    <div style={{
                        flex: 1,
                        overflow: 'auto',
                        padding: '1.5rem 2rem'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1.5rem',
                            marginBottom: '1.5rem'
                        }}>
                            {/* Before (Vulnerable Code) */}
                            <div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.75rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '700',
                                    color: '#ff0055',
                                    fontFamily: 'var(--font-mono)'
                                }}>
                                    <span>❌</span>
                                    BEFORE (Vulnerable)
                                </div>
                                <div style={{
                                    background: 'rgba(255, 0, 85, 0.05)',
                                    border: '2px solid rgba(255, 0, 85, 0.3)',
                                    borderRadius: '0.75rem',
                                    padding: '1rem',
                                    minHeight: '200px'
                                }}>
                                    <pre style={{
                                        margin: 0,
                                        fontSize: '0.8125rem',
                                        color: '#e4e4e7',
                                        fontFamily: 'var(--font-mono)',
                                        lineHeight: 1.6,
                                        overflow: 'auto',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                    }}>
                                        {vulnerability.snippet || '// Original code not available'}
                                    </pre>
                                </div>
                            </div>

                            {/* After (Fixed Code) */}
                            <div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.75rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '700',
                                    color: '#00ff88',
                                    fontFamily: 'var(--font-mono)'
                                }}>
                                    <span>✓</span>
                                    AFTER (Secured)
                                </div>
                                <div style={{
                                    background: 'rgba(0, 255, 136, 0.05)',
                                    border: '2px solid rgba(0, 255, 136, 0.3)',
                                    borderRadius: '0.75rem',
                                    padding: '1rem',
                                    minHeight: '200px',
                                    position: 'relative'
                                }}>
                                    <pre style={{
                                        margin: 0,
                                        fontSize: '0.8125rem',
                                        color: '#e4e4e7',
                                        fontFamily: 'var(--font-mono)',
                                        lineHeight: 1.6,
                                        overflow: 'auto',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                    }}>
                                        {vulnerability.fixCode || '// AI-generated fix will appear here'}
                                    </pre>
                                    {vulnerability.fixCode && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            style={{
                                                position: 'absolute',
                                                top: '0.75rem',
                                                right: '0.75rem'
                                            }}
                                        >
                                            <div style={{
                                                background: 'rgba(0, 255, 136, 0.2)',
                                                border: '1px solid rgba(0, 255, 136, 0.4)',
                                                borderRadius: '0.5rem',
                                                padding: '0.375rem 0.625rem',
                                                fontSize: '0.6875rem',
                                                fontWeight: '800',
                                                color: '#00ff88',
                                                fontFamily: 'var(--font-mono)'
                                            }}>
                                                AI SECURED
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Explanation */}
                        <div style={{
                            background: 'rgba(0, 212, 255, 0.05)',
                            border: '1px solid rgba(0, 212, 255, 0.2)',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                color: '#00d4ff',
                                fontFamily: 'var(--font-mono)',
                                marginBottom: '0.5rem'
                            }}>
                                💡 What Changed?
                            </div>
                            <div style={{
                                fontSize: '0.8125rem',
                                color: '#cbd5e1',
                                lineHeight: 1.6,
                                fontFamily: 'var(--font-mono)'
                            }}>
                                {vulnerability.title} - The AI has sanitized user input and added proper validation to prevent security vulnerabilities.
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div style={{
                        padding: '1.5rem 2rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        gap: '1rem',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={handleCopyFix}
                            disabled={!vulnerability.fixCode}
                            style={{
                                flex: 1,
                                background: copied
                                    ? 'linear-gradient(90deg, #00ff88, #00d4ff)'
                                    : vulnerability.fixCode
                                        ? 'linear-gradient(90deg, rgba(0, 255, 136, 0.15), rgba(0, 212, 255, 0.15))'
                                        : 'rgba(100, 100, 100, 0.1)',
                                border: copied
                                    ? '2px solid #00ff88'
                                    : vulnerability.fixCode
                                        ? '2px solid rgba(0, 255, 136, 0.4)'
                                        : '2px solid rgba(100, 100, 100, 0.2)',
                                color: copied ? '#0a0a0f' : vulnerability.fixCode ? '#00ff88' : '#666',
                                padding: '0.875rem 1.5rem',
                                borderRadius: '0.75rem',
                                fontSize: '0.875rem',
                                fontWeight: '900',
                                cursor: vulnerability.fixCode ? 'pointer' : 'not-allowed',
                                fontFamily: 'var(--font-mono)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.3s ease',
                                opacity: vulnerability.fixCode ? 1 : 0.5
                            }}
                        >
                            {copied ? '✓ COPIED!' : '📋 COPY FIX'}
                        </button>

                        <button
                            onClick={handleCopyCommand}
                            style={{
                                flex: 1,
                                background: commandCopied
                                    ? 'linear-gradient(90deg, #ffaa00, #ff5500)'
                                    : 'linear-gradient(90deg, rgba(255, 170, 0, 0.15), rgba(255, 85, 0, 0.15))',
                                border: commandCopied
                                    ? '2px solid #ffaa00'
                                    : '2px solid rgba(255, 170, 0, 0.4)',
                                color: commandCopied ? '#0a0a0f' : '#ffaa00',
                                padding: '0.875rem 1.5rem',
                                borderRadius: '0.75rem',
                                fontSize: '0.875rem',
                                fontWeight: '900',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-mono)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {commandCopied ? '✓ COPIED!' : '⚡ TEST LOCALLY'}
                        </button>
                    </div>

                    {/* CLI Command Hint */}
                    <div style={{
                        padding: '0 2rem 1.5rem',
                        fontSize: '0.6875rem',
                        color: '#64748b',
                        fontFamily: 'var(--font-mono)',
                        textAlign: 'center'
                    }}>
                        Command: <code style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            color: '#94a3b8'
                        }}>npx aeglyn --test {vulnerability.file}</code>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
