/**
 * Dashboard Feature Components
 * Security Score, Achievements, Education, Community Patterns
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    calculateScore,
    getScoreColor,
    getScoreLabel,
    loadUserStats,
    saveUserStats,
    updateStatsAfterScan,
    getEarnedAchievements,
    getInProgressAchievements,
    type UserStats,
    type SecurityScore,
    type Achievement
} from '@/lib/security-score';
import {
    getEducation,
    getRandomTip,
    type EducationalContent
} from '@/lib/education';
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

// ==================== SECURITY SCORE WIDGET ====================

interface SecurityScoreWidgetProps {
    vulnerabilities: { severity: string }[];
    onScoreCalculated?: (score: SecurityScore) => void;
}

export function SecurityScoreWidget({ vulnerabilities, onScoreCalculated }: SecurityScoreWidgetProps) {
    const [score, setScore] = useState<SecurityScore | null>(null);
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        const calculated = calculateScore(vulnerabilities);
        setScore(calculated);
        onScoreCalculated?.(calculated);

        // Animate score
        const duration = 1500;
        const steps = 60;
        const increment = calculated.score / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= calculated.score) {
                setAnimatedScore(calculated.score);
                clearInterval(timer);
            } else {
                setAnimatedScore(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [vulnerabilities, onScoreCalculated]);

    if (!score) return null;

    const circumference = 2 * Math.PI * 45;
    const progress = (animatedScore / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                background: 'rgba(10, 10, 15, 0.8)',
                border: '2px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '1rem',
                padding: '1.5rem',
                textAlign: 'center'
            }}
        >
            <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#00d4ff', marginBottom: '1rem' }}>
                SECURITY SCORE
            </div>

            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto' }}>
                <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        cx="60"
                        cy="60"
                        r="45"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth="10"
                    />
                    <circle
                        cx="60"
                        cy="60"
                        r="45"
                        fill="none"
                        stroke={getScoreColor(animatedScore)}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - progress}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.1s ease' }}
                    />
                </svg>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '2rem',
                    fontWeight: '900',
                    color: getScoreColor(animatedScore),
                    fontFamily: 'monospace'
                }}>
                    {animatedScore}
                </div>
            </div>

            <div style={{
                marginTop: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '700',
                color: getScoreColor(score.score)
            }}>
                {getScoreLabel(score.score)}
            </div>

            <div style={{
                marginTop: '1rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                fontSize: '0.625rem',
                fontFamily: 'monospace'
            }}>
                <div style={{ color: '#ff0055' }}>🔴 CRIT: {score.breakdown.critical}</div>
                <div style={{ color: '#ff6600' }}>⚠️ HIGH: {score.breakdown.high}</div>
                <div style={{ color: '#ffaa00' }}>🟡 MED: {score.breakdown.medium}</div>
                <div style={{ color: '#88ff00' }}>🟢 LOW: {score.breakdown.low}</div>
            </div>
        </motion.div>
    );
}

// ==================== ACHIEVEMENTS PANEL ====================

interface AchievementsPanelProps {
    stats: UserStats;
}

export function AchievementsPanel({ stats }: AchievementsPanelProps) {
    const [expanded, setExpanded] = useState(false);
    const earned = getEarnedAchievements(stats);
    const inProgress = getInProgressAchievements(stats);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: 'rgba(10, 10, 15, 0.8)',
                border: '2px solid rgba(255, 170, 0, 0.3)',
                borderRadius: '1rem',
                padding: '1rem',
                marginTop: '1rem'
            }}
        >
            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                }}
            >
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ffaa00' }}>
                    🏆 ACHIEVEMENTS ({earned.length}/{stats.achievements.length})
                </span>
                <span style={{ color: '#666', fontSize: '0.75rem' }}>
                    {expanded ? '▲' : '▼'}
                </span>
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', marginTop: '1rem' }}
                    >
                        {/* Earned */}
                        {earned.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.625rem', color: '#00ff88', marginBottom: '0.5rem' }}>
                                    ✅ EARNED
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {earned.map(a => (
                                        <div
                                            key={a.id}
                                            title={`${a.name}: ${a.description}`}
                                            style={{
                                                background: 'rgba(0, 255, 136, 0.1)',
                                                border: '1px solid rgba(0, 255, 136, 0.3)',
                                                borderRadius: '0.5rem',
                                                padding: '0.5rem',
                                                fontSize: '1.25rem',
                                                cursor: 'help'
                                            }}
                                        >
                                            {a.emoji}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* In Progress */}
                        {inProgress.length > 0 && (
                            <div>
                                <div style={{ fontSize: '0.625rem', color: '#ffaa00', marginBottom: '0.5rem' }}>
                                    🔄 IN PROGRESS
                                </div>
                                {inProgress.map(a => (
                                    <div
                                        key={a.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '0.5rem',
                                            fontSize: '0.625rem'
                                        }}
                                    >
                                        <span>{a.emoji}</span>
                                        <span style={{ color: '#888' }}>{a.name}</span>
                                        <div style={{
                                            flex: 1,
                                            height: '4px',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: '2px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${((a.progress || 0) / (a.maxProgress || 1)) * 100}%`,
                                                height: '100%',
                                                background: '#ffaa00'
                                            }} />
                                        </div>
                                        <span style={{ color: '#666' }}>
                                            {a.progress}/{a.maxProgress}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Stats */}
                        <div style={{
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.5rem',
                            fontSize: '0.625rem',
                            color: '#888'
                        }}>
                            <div>📊 Scans: {stats.totalScans}</div>
                            <div>🔧 Fixes: {stats.totalFixes}</div>
                            <div>🔍 Found: {stats.vulnerabilitiesFound}</div>
                            <div>✅ Fixed: {stats.vulnerabilitiesFixed}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ==================== EDUCATION PANEL ====================

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
                background: 'rgba(0, 153, 255, 0.05)',
                border: '1px solid rgba(0, 153, 255, 0.2)',
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
                    background: 'rgba(0, 153, 255, 0.1)',
                    border: 'none',
                    padding: '0.75rem',
                    cursor: 'pointer'
                }}
            >
                <span style={{ fontSize: '0.75rem', color: '#00d4ff', fontWeight: '600' }}>
                    📚 Learn More: {content.title}
                </span>
                <span style={{ color: '#00d4ff' }}>{expanded ? '−' : '+'}</span>
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
                                        background: mode === 'simple' ? '#00d4ff' : 'transparent',
                                        color: mode === 'simple' ? '#fff' : '#00d4ff',
                                        border: '1px solid #00d4ff',
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
                                        background: mode === 'technical' ? '#00d4ff' : 'transparent',
                                        color: mode === 'technical' ? '#fff' : '#00d4ff',
                                        border: '1px solid #00d4ff',
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

                                <div style={{ fontSize: '0.625rem', color: '#00ff88', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                                    ✅ SECURE CODE
                                </div>
                                <pre style={{
                                    background: 'rgba(0, 255, 136, 0.1)',
                                    border: '1px solid rgba(0, 255, 136, 0.3)',
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
                                <div style={{ fontSize: '0.625rem', color: '#00d4ff', marginBottom: '0.5rem' }}>
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
                                                color: '#00d4ff',
                                                textDecoration: 'none',
                                                background: 'rgba(0, 212, 255, 0.1)',
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

// ==================== COMMUNITY PATTERNS PANEL ====================

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
                border: '2px solid rgba(136, 255, 0, 0.3)',
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
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#88ff00' }}>
                    🗃️ COMMUNITY PATTERNS
                </span>
                <button
                    onClick={() => setShowSubmit(!showSubmit)}
                    style={{
                        background: 'rgba(136, 255, 0, 0.15)',
                        border: '1px solid rgba(136, 255, 0, 0.3)',
                        color: '#88ff00',
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
                            background: 'rgba(136, 255, 0, 0.05)',
                            border: '1px solid rgba(136, 255, 0, 0.2)',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            marginBottom: '1rem'
                        }}
                    >
                        <div style={{ fontSize: '0.625rem', color: '#88ff00', marginBottom: '0.75rem' }}>
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
                                background: formData.name && formData.pattern ? '#88ff00' : 'rgba(136, 255, 0, 0.3)',
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
                                color: hasVotedFor(p.id) ? '#88ff00' : '#666'
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

// ==================== SECURITY TIP BANNER ====================

export function SecurityTipBanner() {
    const [tip, setTip] = useState('');

    useEffect(() => {
        setTip(getRandomTip());
        const interval = setInterval(() => setTip(getRandomTip()), 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            key={tip}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                fontSize: '0.75rem',
                color: '#00d4ff',
                textAlign: 'center'
            }}
        >
            {tip}
        </motion.div>
    );
}

// ==================== GITHUB ACTION SETUP MODAL ====================

interface GitHubActionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GitHubActionModal({ isOpen, onClose }: GitHubActionModalProps) {
    const [copied, setCopied] = useState(false);

    const actionYaml = `# Add this to .github/workflows/vulscany.yml
name: 🛡️ Aeglyn Security Scan

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - name: Run Aeglyn Scan
        run: |
          # The full logic is in the downloadable action file
          echo "Scanning for web vulnerabilities..."`;

    const handleCopy = () => {
        navigator.clipboard.writeText(actionYaml);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                    background: '#0a0a0f',
                    border: '2px solid rgba(0, 212, 255, 0.5)',
                    borderRadius: '1rem',
                    padding: '2rem',
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '80vh',
                    overflow: 'auto'
                }}
                onClick={e => e.stopPropagation()}
            >
                <h2 style={{ fontSize: '1.25rem', color: '#00d4ff', marginBottom: '1rem' }}>
                    🎬 GitHub Action Setup
                </h2>

                <p style={{ fontSize: '0.875rem', color: '#aaa', marginBottom: '1rem' }}>
                    Add this workflow to your repository to automatically scan for security issues on every Pull Request.
                </p>

                <div style={{ position: 'relative' }}>
                    <pre style={{
                        background: 'rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        fontSize: '0.6875rem',
                        color: '#e0e0e0',
                        overflow: 'auto',
                        fontFamily: 'monospace'
                    }}>
                        {actionYaml}
                    </pre>

                    <button
                        onClick={handleCopy}
                        style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            background: copied ? '#00ff88' : 'rgba(0, 212, 255, 0.2)',
                            border: 'none',
                            borderRadius: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.625rem',
                            color: copied ? '#000' : '#00d4ff',
                            cursor: 'pointer'
                        }}
                    >
                        {copied ? '✓ Copied!' : '📋 Copy'}
                    </button>
                </div>

                <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#888' }}>
                    <h3 style={{ color: '#00d4ff', marginBottom: '0.5rem' }}>Instructions:</h3>
                    <ol style={{ paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                        <li>Create <code>.github/workflows/</code> directory in your repo</li>
                        <li>Create <code>vulscany.yml</code> file</li>
                        <li>Paste the workflow content</li>
                        <li>Commit and push</li>
                        <li>Scan triggers on every Push and Pull Request!</li>
                    </ol>
                </div>

                <a
                    href="/vulscany-action.yml"
                    download
                    style={{
                        display: 'inline-block',
                        marginTop: '1rem',
                        background: '#00d4ff',
                        color: '#000',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textDecoration: 'none'
                    }}
                >
                    ⬇️ Download Full Action
                </a>

                <button
                    onClick={onClose}
                    style={{
                        marginLeft: '0.5rem',
                        marginTop: '1rem',
                        background: 'transparent',
                        border: '1px solid #666',
                        color: '#666',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                    }}
                >
                    Close
                </button>
            </motion.div>
        </motion.div>
    );
}
