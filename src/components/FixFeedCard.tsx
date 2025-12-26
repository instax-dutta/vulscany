/**
 * Unified Fix Feed Card Component
 * Consolidates vulnerability display: Issue → Explanation → Fix Preview → CTAs
 */

'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Vulnerability {
    id: string;
    type: string;
    title: string;
    description: string;
    file: string;
    line?: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    snippet?: string;
    aiAnalysis?: {
        explanation?: { technicalDetails?: string };
        fixSuggestion?: string;
        vibePrompt?: string;
    };
}

interface FixFeedCardProps {
    vulnerability: Vulnerability;
    onGetFix: () => void;
    onCopyFix: () => void;
    onPreviewFix: () => void;
    isLoading?: boolean;
    isSimpleMode?: boolean;
}

const severityStyles = {
    critical: {
        bg: 'var(--color-critical-bg)',
        border: 'var(--color-critical-border)',
        color: 'var(--color-critical)',
        label: 'CRITICAL',
        icon: '🔴'
    },
    high: {
        bg: 'var(--color-high-bg)',
        border: 'var(--color-high-border)',
        color: 'var(--color-high)',
        label: 'HIGH',
        icon: '🟠'
    },
    medium: {
        bg: 'var(--color-medium-bg)',
        border: 'var(--color-medium-border)',
        color: 'var(--color-medium)',
        label: 'MEDIUM',
        icon: '🟡'
    },
    low: {
        bg: 'var(--color-low-bg)',
        border: 'var(--color-low-border)',
        color: 'var(--color-low)',
        label: 'LOW',
        icon: '🟢'
    }
};

export function FixFeedCard({
    vulnerability,
    onGetFix,
    onCopyFix,
    onPreviewFix,
    isLoading,
    isSimpleMode = true
}: FixFeedCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const style = severityStyles[vulnerability.severity];
    const hasFix = Boolean(vulnerability.aiAnalysis?.fixSuggestion);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: style.bg,
                border: `2px solid ${style.border}`,
                borderRadius: '1rem',
                overflow: 'hidden',
                marginBottom: '1rem'
            }}
        >
            {/* Header - Always Visible */}
            <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>{style.icon}</span>
                            <h4 style={{
                                fontSize: '1.125rem',
                                fontWeight: '900',
                                color: style.color,
                                fontFamily: 'var(--font-mono)',
                                margin: 0
                            }}>
                                {vulnerability.title}
                            </h4>
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: '#64748b',
                            fontFamily: 'var(--font-mono)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            flexWrap: 'wrap'
                        }}>
                            <span>{vulnerability.file}</span>
                            {vulnerability.line && (
                                <>
                                    <span>•</span>
                                    <span>Line {vulnerability.line}</span>
                                </>
                            )}
                            <span>•</span>
                            <span style={{
                                background: style.bg,
                                border: `1px solid ${style.border}`,
                                color: style.color,
                                padding: '0.125rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontWeight: '700'
                            }}>
                                {style.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p style={{
                    fontSize: '0.875rem',
                    color: '#cbd5e1',
                    lineHeight: 1.6,
                    margin: '0 0 1rem 0',
                    fontFamily: 'var(--font-mono)'
                }}>
                    {vulnerability.description}
                </p>

                {/* Primary Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {!hasFix && (
                        <button
                            onClick={onGetFix}
                            disabled={isLoading}
                            style={{
                                background: isLoading
                                    ? 'rgba(100, 100, 100, 0.2)'
                                    : 'linear-gradient(135deg, #00ff88, #00ccff)',
                                border: 'none',
                                color: isLoading ? '#666' : '#0a0a0f',
                                padding: '0.625rem 1.25rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.8125rem',
                                fontWeight: '900',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                fontFamily: 'var(--font-mono)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s',
                                opacity: isLoading ? 0.6 : 1
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        style={{
                                            display: 'inline-block',
                                            width: '12px',
                                            height: '12px',
                                            border: '2px solid #666',
                                            borderTopColor: 'transparent',
                                            borderRadius: '50%'
                                        }}
                                    />
                                    ANALYZING...
                                </>
                            ) : (
                                <>🤖 GET AI FIX</>
                            )}
                        </button>
                    )}

                    {hasFix && (
                        <>
                            <button
                                onClick={onPreviewFix}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 204, 255, 0.15))',
                                    border: '2px solid rgba(0, 255, 136, 0.4)',
                                    color: '#00ff88',
                                    padding: '0.625rem 1.25rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.8125rem',
                                    fontWeight: '900',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-mono)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                👁️ PREVIEW FIX
                            </button>

                            <button
                                onClick={onCopyFix}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255, 170, 0, 0.15), rgba(255, 85, 0, 0.15))',
                                    border: '2px solid rgba(255, 170, 0, 0.4)',
                                    color: '#ffaa00',
                                    padding: '0.625rem 1.25rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.8125rem',
                                    fontWeight: '900',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-mono)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                📋 COPY FIX
                            </button>
                        </>
                    )}

                    {vulnerability.snippet && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#94a3b8',
                                padding: '0.625rem 1rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.8125rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-mono)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginLeft: 'auto'
                            }}
                        >
                            {isExpanded ? '🔼 HIDE' : '👁️ VIEW CODE'}
                        </button>
                    )}
                </div>
            </div>

            {/* Expandable: Code Snippet */}
            {isExpanded && vulnerability.snippet && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{
                        borderTop: `1px solid ${style.border}`,
                        background: 'rgba(0, 0, 0, 0.3)'
                    }}
                >
                    <div style={{ padding: '1.25rem' }}>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            color: style.color,
                            marginBottom: '0.75rem',
                            fontFamily: 'var(--font-mono)'
                        }}>
                            VULNERABLE CODE:
                        </div>
                        <pre style={{
                            margin: 0,
                            fontSize: '0.8125rem',
                            color: '#e4e4e7',
                            fontFamily: 'var(--font-mono)',
                            lineHeight: 1.6,
                            overflow: 'auto',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            background: 'rgba(0, 0, 0, 0.4)',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${style.border}`
                        }}>
                            {vulnerability.snippet}
                        </pre>
                    </div>
                </motion.div>
            )}

            {/* AI Explanation Strip */}
            {hasFix && vulnerability.aiAnalysis && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    style={{
                        borderTop: `1px solid ${style.border}`,
                        background: 'rgba(0, 255, 136, 0.03)',
                        padding: '1rem 1.25rem'
                    }}
                >
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#00ff88',
                        marginBottom: '0.5rem',
                        fontFamily: 'var(--font-mono)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span>🤖</span>
                        AI RECOMMENDATION
                    </div>
                    <div style={{
                        fontSize: '0.8125rem',
                        color: '#cbd5e1',
                        lineHeight: 1.6,
                        fontFamily: 'var(--font-mono)'
                    }}>
                        {isSimpleMode
                            ? "This issue allows attackers to inject malicious code. The fix adds proper sanitization."
                            : vulnerability.aiAnalysis.explanation?.technicalDetails || "Fix applied with industry-standard security practices."}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
