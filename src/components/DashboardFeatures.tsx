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
    threatIntel?: { riskScore: number };
    onScoreCalculated?: (score: SecurityScore) => void;
}

export function SecurityScoreWidget({ vulnerabilities, threatIntel, onScoreCalculated }: SecurityScoreWidgetProps) {
    const [score, setScore] = useState<SecurityScore | null>(null);
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        const calculated = calculateScore(vulnerabilities, threatIntel);
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
    }, [vulnerabilities, threatIntel, onScoreCalculated]);

    if (!score) return null;

    const circumference = 2 * Math.PI * 34; // Slightly smaller for horizontal fit
    const progress = (animatedScore / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row items-center gap-4 md:gap-6 bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:px-6 md:py-3 transition-colors hover:bg-white/[0.05]"
        >
            {/* Left Side: Circular Score */}
            <div className="relative w-16 h-16 shrink-0">
                <svg width="64" height="64" className="rotate-[-90deg]">
                    <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.05)"
                        strokeWidth="6"
                    />
                    <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke={getScoreColor(animatedScore)}
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - progress}
                        strokeLinecap="round"
                        className="transition-all duration-300 ease-out"
                    />
                </svg>
                <div
                    className="absolute inset-0 flex items-center justify-center font-mono font-black text-lg"
                    style={{ color: getScoreColor(animatedScore) }}
                >
                    {animatedScore}
                </div>
            </div>

            {/* Right Side: Label & Breakdown */}
            <div className="flex flex-col items-center md:items-start min-w-[140px]">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest leading-none">Status</span>
                    <span
                        className="text-xs font-bold leading-none"
                        style={{ color: getScoreColor(score.score) }}
                    >
                        {getScoreLabel(score.score)}
                    </span>
                </div>

                <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1.5" title="Critical Issues">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                        <span className="text-[10px] font-mono font-bold text-white/60">{score.breakdown.critical}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="High Risk Issues">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                        <span className="text-[10px] font-mono font-bold text-white/60">{score.breakdown.high}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Medium Risk Issues">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        <span className="text-[10px] font-mono font-bold text-white/60">{score.breakdown.medium}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Low Risk Issues">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-mono font-bold text-white/60">{score.breakdown.low}</span>
                    </div>
                </div>
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
                                <div style={{ fontSize: '0.625rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                                    ✅ EARNED
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {earned.map(a => (
                                        <div
                                            key={a.id}
                                            title={`${a.name}: ${a.description}`}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                border: '1px solid rgba(255, 255, 255, 0.3)',
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
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                fontSize: '0.75rem',
                color: 'var(--primary)',
                textAlign: 'center'
            }}
        >
            {tip}
        </motion.div>
    );
}
