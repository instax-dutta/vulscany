'use client';

import { ChevronRight } from 'lucide-react';

interface DashboardHeaderProps {
    currentRepoKey: string | null;
    batchMode: boolean;
    scanning: boolean;
    selectedReposCount: number;
    onBatchModeToggle: () => void;
    onScanBatch: () => void;
}

export function DashboardHeader({
    currentRepoKey,
    batchMode,
    scanning,
    selectedReposCount,
    onBatchModeToggle,
    onScanBatch,
}: DashboardHeaderProps) {
    return (
        <nav className="h-14 border-b border-white/5 bg-black/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-white/40">Projects</span>
                <ChevronRight className="w-3 h-3 text-white/20" />
                {currentRepoKey ? (
                    <>
                        <span className="text-white/60">{currentRepoKey.split('/')[0]}</span>
                        <ChevronRight className="w-3 h-3 text-white/20" />
                        <span className="text-white font-bold">{currentRepoKey.split('/')[1]}</span>
                    </>
                ) : (
                    <span className="text-white/60">Overview</span>
                )}
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={onBatchModeToggle}
                    className={`px-3 py-1.5 text-[10px] font-bold font-mono rounded-lg border transition-all ${batchMode
                        ? 'bg-primary text-black border-primary'
                        : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                    }`}
                >
                    {batchMode ? 'BATCH ACTIVE' : 'BATCH MODE'}
                </button>
                {batchMode && selectedReposCount > 0 && (
                    <button
                        onClick={onScanBatch}
                        disabled={scanning}
                        className="px-3 py-1.5 text-[10px] font-bold font-mono rounded-lg bg-white text-black hover:bg-white/90 transition-all disabled:opacity-50"
                    >
                        SCAN {selectedReposCount}
                    </button>
                )}
            </div>
        </nav>
    );
}
