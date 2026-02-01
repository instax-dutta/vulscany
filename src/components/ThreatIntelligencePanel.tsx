/**
 * Threat Intelligence Panel Component
 * High-value visualization with intelligent decluttering
 */

'use client';

import { motion } from 'framer-motion';
import { Shield, Activity, AlertTriangle, TrendingUp, FileText, ExternalLink } from 'lucide-react';

interface ThreatIntelligence {
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    cveCount: number;
    advisoryCount: number;
    criticalThreats: number;
    recommendations: string[];
    displayInUI?: boolean;
}

interface ThreatIntelligencePanelProps {
    threatData: ThreatIntelligence;
    repoName?: string;
}

export function ThreatIntelligencePanel({ threatData, repoName }: ThreatIntelligencePanelProps) {
    const { riskScore, riskLevel, cveCount, advisoryCount, criticalThreats, recommendations } = threatData;

    // Color mapping based on risk level
    const riskColors = {
        LOW: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]' },
        MEDIUM: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]' },
        HIGH: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-500', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.15)]' },
        CRITICAL: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-500', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]' }
    };

    const colors = riskColors[riskLevel];

    // Calculate gauge rotation (0-180 degrees for semi-circle)
    const gaugeRotation = (riskScore / 100) * 180;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-white/10 transition-colors"
        >
            {/* Background Glow Effect */}
            <div className={`absolute -top-20 -right-20 w-64 h-64 ${colors.bg} blur-[100px] rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-700`} />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 ${colors.bg} rounded-xl ${colors.text} ${colors.glow}`}>
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Threat Intelligence</h3>
                        <p className="text-xs font-mono text-white/40 uppercase tracking-widest">Advanced Risk Profiling</p>
                    </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold font-mono tracking-widest border ${colors.bg} ${colors.border} ${colors.text}`}>
                    {riskLevel} RISK
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="relative z-10 grid grid-cols-12 gap-4">
                {/* Risk Gauge - Takes 5 columns */}
                <div className="col-span-12 md:col-span-5 bg-white/5 rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Circular Gauge Background */}
                    <div className="relative w-40 h-20 mb-4">
                        {/* Base Arc */}
                        <svg
                            className="absolute inset-0 w-full h-full"
                            viewBox="0 0 160 80"
                            preserveAspectRatio="xMidYMid meet"
                            style={{ shapeRendering: 'geometricPrecision' }}
                        >
                            <path
                                d="M 10 70 A 70 70 0 0 1 150 70"
                                fill="none"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="14"
                                strokeLinecap="round"
                            />
                            {/* Active Arc */}
                            <motion.path
                                d="M 10 70 A 70 70 0 0 1 150 70"
                                fill="none"
                                stroke={riskLevel === 'CRITICAL' ? '#ef4444' : riskLevel === 'HIGH' ? '#f97316' : riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981'}
                                strokeWidth="14"
                                strokeLinecap="round"
                                strokeDasharray={220}
                                strokeDashoffset={220 - (220 * riskScore) / 100}
                                initial={{ strokeDashoffset: 220 }}
                                animate={{ strokeDashoffset: 220 - (220 * riskScore) / 100 }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                className={`drop-shadow-[0_0_8px_currentColor]`}
                                style={{ shapeRendering: 'geometricPrecision' }}
                            />
                        </svg>
                        {/* Needle Indicator */}
                        <motion.div
                            className="absolute bottom-0 left-1/2 w-1 h-14 bg-white/80 origin-bottom -ml-0.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            style={{ transformOrigin: 'bottom center' }}
                            initial={{ rotate: 0 }}
                            animate={{ rotate: gaugeRotation - 90 }}
                            transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                        />
                    </div>

                    {/* Risk Score Display */}
                    <div className="text-center">
                        <div className={`text-4xl font-black ${colors.text} mb-1`}>{riskScore}%</div>
                        <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Risk Index</div>
                    </div>

                    {/* Pulse Animation Border */}
                    <motion.div
                        className={`absolute inset-0 rounded-2xl border ${colors.border}`}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>

                {/* Intelligence Metrics - 7 columns, 2x2 grid */}
                <div className="col-span-12 md:col-span-7 grid grid-cols-2 gap-4">
                    {/* CVE Count */}
                    <div className="bg-white/5 rounded-2xl border border-white/5 p-5 hover:bg-white/[0.07] transition-colors group/card">
                        <div className="flex items-start justify-between mb-3">
                            <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">CVE Identifiers</div>
                            <AlertTriangle className="w-4 h-4 text-red-400/50 group-hover/card:text-red-400 transition-colors" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-black text-white">{cveCount}</div>
                            {criticalThreats > 0 && (
                                <div className="text-xs font-bold font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                                    {criticalThreats} CRITICAL
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Advisory Count */}
                    <div className="bg-white/5 rounded-2xl border border-white/5 p-5 hover:bg-white/[0.07] transition-colors group/card">
                        <div className="flex items-start justify-between mb-3">
                            <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Security Advisories</div>
                            <FileText className="w-4 h-4 text-amber-400/50 group-hover/card:text-amber-400 transition-colors" />
                        </div>
                        <div className="text-3xl font-black text-white">{advisoryCount}</div>
                    </div>

                    {/* Active Monitoring Status */}
                    <div className="bg-white/5 rounded-2xl border border-white/5 p-5 hover:bg-white/[0.07] transition-colors group/card">
                        <div className="flex items-start justify-between mb-3">
                            <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Threat Status</div>
                            <Activity className="w-4 h-4 text-emerald-400/50 group-hover/card:text-emerald-400 transition-colors" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                            <div className="text-xs font-bold font-mono text-emerald-400">MONITORING</div>
                        </div>
                    </div>

                    {/* Recommendations Count */}
                    <div className="bg-white/5 rounded-2xl border border-white/5 p-5 hover:bg-white/[0.07] transition-colors group/card">
                        <div className="flex items-start justify-between mb-3">
                            <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Recommendations</div>
                            <TrendingUp className="w-4 h-4 text-blue-400/50 group-hover/card:text-blue-400 transition-colors" />
                        </div>
                        <div className="text-3xl font-black text-white">{recommendations.length}</div>
                    </div>
                </div>
            </div>

            {/* Top Recommendations Section */}
            {recommendations.length > 0 && (
                <div className="relative z-10 mt-6 pt-6 border-t border-white/5">
                    <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-3">Priority Actions</div>
                    <div className="space-y-2">
                        {recommendations.slice(0, 3).map((rec, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start gap-3 p-3 bg-white/[0.03] rounded-lg border border-white/5 hover:bg-white/[0.05] transition-colors group/rec"
                            >
                                <div className={`mt-0.5 w-1.5 h-1.5 rounded-full ${colors.bg.replace('/10', '')} flex-shrink-0`} />
                                <p className="text-xs text-white/60 leading-relaxed group-hover/rec:text-white/80 transition-colors">{rec}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
