'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getEarnedAchievements, getInProgressAchievements, type UserStats } from '@/lib/security-score';

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
