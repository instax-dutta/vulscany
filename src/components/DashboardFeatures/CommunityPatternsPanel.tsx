'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    loadCommunityPatterns,
    submitPattern,
    voteForPattern,
    hasVotedFor,
    getTopPatterns,
    CATEGORY_LABELS,
    SEVERITY_COLORS,
    type CommunityPattern
} from '@/lib/community-patterns';

interface CommunityPatternsPanelProps {
    onPatternSubmit?: () => void;
}

export function CommunityPatternsPanel({ onPatternSubmit }: CommunityPatternsPanelProps) {
    const [patterns, setPatterns] = useState<CommunityPattern[]>([]);
    const [showSubmit, setShowSubmit] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        pattern: '',
        severity: 'medium' as CommunityPattern['severity'],
        category: 'other' as CommunityPattern['category'],
        framework: 'generic' as CommunityPattern['framework'],
        recommendation: ''
    });

    useEffect(() => {
        setPatterns(getTopPatterns(5));
    }, []);

    const handleVote = (id: string) => {
        if (!hasVotedFor(id)) {
            voteForPattern(id);
            setPatterns(getTopPatterns(5));
        }
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.pattern) return;

        submitPattern(
            formData.name,
            formData.description,
            formData.pattern,
            formData.severity,
            formData.category,
            formData.framework,
            formData.recommendation,
            'Anonymous'
        );

        setFormData({
            name: '',
            description: '',
            pattern: '',
            severity: 'medium',
            category: 'other',
            framework: 'generic',
            recommendation: ''
        });
        setShowSubmit(false);
        setPatterns(getTopPatterns(5));
        onPatternSubmit?.();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: 'rgba(10, 10, 15, 0.8)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '1rem',
                padding: '1rem',
                marginTop: '1rem'
            }}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--primary)' }}>
                    🗃️ COMMUNITY PATTERNS
                </span>
                <button
                    onClick={() => setShowSubmit(!showSubmit)}
                    style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'var(--primary)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.625rem',
                        cursor: 'pointer'
                    }}
                >
                    {showSubmit ? '✕ CLOSE' : '+ ADD'}
                </button>
            </div>

            {/* Submit Form */}
            <AnimatePresence>
                {showSubmit && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            marginBottom: '1rem'
                        }}
                    >
                        <div style={{ fontSize: '0.625rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                            📝 SUBMIT NEW PATTERN
                        </div>

                        <input
                            placeholder="Pattern Name"
                            value={formData.name}
                            onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                            style={{
                                width: '100%',
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '0.25rem',
                                padding: '0.5rem',
                                fontSize: '0.6875rem',
                                color: '#fff',
                                marginBottom: '0.5rem'
                            }}
                        />

                        <input
                            placeholder="Regex Pattern (e.g., eval\s*\()"
                            value={formData.pattern}
                            onChange={e => setFormData(f => ({ ...f, pattern: e.target.value }))}
                            style={{
                                width: '100%',
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '0.25rem',
                                padding: '0.5rem',
                                fontSize: '0.6875rem',
                                color: '#fff',
                                fontFamily: 'monospace',
                                marginBottom: '0.5rem'
                            }}
                        />

                        <textarea
                            placeholder="Description"
                            value={formData.description}
                            onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                            style={{
                                width: '100%',
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '0.25rem',
                                padding: '0.5rem',
                                fontSize: '0.6875rem',
                                color: '#fff',
                                marginBottom: '0.5rem',
                                minHeight: '60px',
                                resize: 'vertical'
                            }}
                        />

                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <select
                                value={formData.severity}
                                onChange={e => setFormData(f => ({ ...f, severity: e.target.value as any }))}
                                style={{
                                    flex: 1,
                                    background: 'rgba(0, 0, 0, 0.3)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '0.25rem',
                                    padding: '0.5rem',
                                    fontSize: '0.6875rem',
                                    color: '#fff'
                                }}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>

                            <select
                                value={formData.category}
                                onChange={e => setFormData(f => ({ ...f, category: e.target.value as any }))}
                                style={{
                                    flex: 1,
                                    background: 'rgba(0, 0, 0, 0.3)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '0.25rem',
                                    padding: '0.5rem',
                                    fontSize: '0.6875rem',
                                    color: '#fff'
                                }}
                            >
                                <option value="xss">XSS</option>
                                <option value="injection">Injection</option>
                                <option value="auth">Auth</option>
                                <option value="crypto">Crypto</option>
                                <option value="config">Config</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <input
                            placeholder="Recommendation"
                            value={formData.recommendation}
                            onChange={e => setFormData(f => ({ ...f, recommendation: e.target.value }))}
                            style={{
                                width: '100%',
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '0.25rem',
                                padding: '0.5rem',
                                fontSize: '0.6875rem',
                                color: '#fff',
                                marginBottom: '0.75rem'
                            }}
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={!formData.name || !formData.pattern}
                            style={{
                                width: '100%',
                                background: formData.name && formData.pattern ? 'var(--primary)' : 'rgba(255, 255, 255, 0.3)',
                                border: 'none',
                                borderRadius: '0.25rem',
                                padding: '0.5rem',
                                fontSize: '0.6875rem',
                                fontWeight: '700',
                                color: '#0a0a0f',
                                cursor: formData.name && formData.pattern ? 'pointer' : 'not-allowed'
                            }}
                        >
                            SUBMIT PATTERN
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pattern List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {patterns.map(p => (
                    <div
                        key={p.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.5rem',
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: '0.25rem'
                        }}
                    >
                        <button
                            onClick={() => handleVote(p.id)}
                            disabled={hasVotedFor(p.id)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.125rem',
                                background: 'none',
                                border: 'none',
                                cursor: hasVotedFor(p.id) ? 'default' : 'pointer',
                                color: hasVotedFor(p.id) ? 'var(--primary)' : '#666'
                            }}
                        >
                            <span style={{ fontSize: '0.875rem' }}>▲</span>
                            <span style={{ fontSize: '0.625rem', fontFamily: 'monospace' }}>{p.votes}</span>
                        </button>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.125rem'
                            }}>
                                <span style={{ fontSize: '0.6875rem', color: '#fff', fontWeight: '600' }}>
                                    {p.name}
                                </span>
                                <span style={{
                                    fontSize: '0.5rem',
                                    padding: '0.125rem 0.25rem',
                                    background: SEVERITY_COLORS[p.severity] + '20',
                                    color: SEVERITY_COLORS[p.severity],
                                    borderRadius: '0.125rem'
                                }}>
                                    {p.severity.toUpperCase()}
                                </span>
                                {p.verified && (
                                    <span style={{ fontSize: '0.625rem' }} title="Verified">✓</span>
                                )}
                            </div>
                            <div style={{ fontSize: '0.5625rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {p.description}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
