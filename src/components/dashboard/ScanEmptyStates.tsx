'use client';

import { Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { RemediationBlock } from '@/components/RemediationBlock';

interface ThreatIntelligence {
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    cveCount: number;
    advisoryCount: number;
    scanFindingsCount?: number;
    criticalThreats: number;
    recommendations: string[];
    displayInUI?: boolean;
}

interface ScanResult {
    repoName: string;
    owner: string;
    scanTimestamp: string;
    vulnerabilities: Array<{ id: string }>;
    status: 'safe' | 'needs-attention' | 'high-risk';
    summary: string;
    threatIntelligence?: ThreatIntelligence;
}

interface ScanEmptyStatesProps {
    scanning: boolean;
    currentResult: ScanResult | null;
    currentRepoKey: string | null;
}

export function ScanEmptyStates({
    scanning,
    currentResult,
    currentRepoKey,
}: ScanEmptyStatesProps) {
    // State 1: Scanning spinner (when scanning and no currentResult yet)
    if (scanning && !currentResult) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="relative">
                    <div className="w-16 h-16 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Search className="w-6 h-6 text-primary" />
                    </div>
                </div>
                <div className="mt-6 text-sm font-mono text-white/40 tracking-widest uppercase">Analyzing codebase...</div>
                <div className="mt-2 text-[10px] font-mono text-primary/60 animate-pulse">Running advanced security heuristics</div>
            </div>
        );
    }

    // State 2: No project selected (no currentResult and not scanning)
    if (!currentResult && !scanning) {
        return (
            <div className="flex flex-col items-center justify-center py-40 bg-white/[0.01] border border-white/5 border-dashed rounded-[40px]">
                <div className="w-20 h-20 bg-white/5 flex items-center justify-center rounded-full mb-8">
                    <Search className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Select a Project</h3>
                <p className="text-white/40 text-sm font-mono max-w-xs text-center leading-relaxed">
                    Choose a repository from the left sidebar to initiate a deep security audit.
                </p>
            </div>
        );
    }

    // State 3: No vulns found (currentResult exists but no vulnerabilities)
    if (currentResult && currentResult.vulnerabilities.length === 0) {
        if (currentResult.threatIntelligence && ['HIGH', 'CRITICAL'].includes(currentResult.threatIntelligence.riskLevel)) {
            // Supply chain risks detected
            return (
                <div className="flex flex-col items-center justify-center py-20 bg-red-500/[0.02] border border-red-500/10 rounded-[32px] text-center px-6 animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-red-500/10 flex items-center justify-center rounded-2xl mb-6 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                        <div className="relative">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Supply Chain Risks Detected</h3>
                    <p className="text-sm text-white/50 font-mono max-w-md mx-auto mb-4 leading-relaxed">
                        While your source code appears clean, critical vulnerabilities have been detected in your <span className="text-red-400 font-bold">project dependencies</span>.
                    </p>

                    <RemediationBlock />

                    <button
                        onClick={() => document.getElementById('threat-intel-panel')?.scrollIntoView({ behavior: 'smooth' })}
                        className="h-12 px-8 bg-red-500 hover:bg-red-600 text-white font-bold font-mono text-xs tracking-wider rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/20"
                    >
                        REVIEW THREAT INTELLIGENCE ↓
                    </button>
                </div>
            );
        }

        // Codebase is protected
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-[32px] text-center px-6">
                <div className="w-16 h-16 bg-emerald-500/10 flex items-center justify-center rounded-2xl mb-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Codebase is Protected</h3>
                <p className="text-sm text-white/40 font-mono max-w-sm uppercase tracking-tight">Zero security vulnerabilities have been detected in this audit cycle.</p>
            </div>
        );
    }

    return null;
}
