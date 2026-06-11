'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { calculateScore, getScoreColor, getScoreLabel, type SecurityScore } from '@/lib/security-score';

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
