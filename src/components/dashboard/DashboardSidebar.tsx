'use client';

import { Search, LogOut, Trophy, RefreshCw } from 'lucide-react';
import { AchievementsPanel, CommunityPatternsPanel } from '@/components/DashboardFeatures';
import type { UserStats } from '@/lib/security-score';

interface Repository {
    id: number;
    name: string;
    owner: string;
    private: boolean;
    language: string | null;
    scanStatus?: 'pending' | 'scanning' | 'safe' | 'issues' | 'critical';
    issueCount?: number;
}

interface DashboardSidebarProps {
    userName: string;
    userAvatar: string | null;
    filteredRepositories: Repository[];
    loading: boolean;
    selectedRepos: Set<number>;
    batchMode: boolean;
    sidebarSearch: string;
    currentRepoKey: string | null;
    userStats: UserStats | null;
    scanRepo: (repo: Repository, force?: boolean) => Promise<void>;
    toggleRepoSelection: (id: number) => void;
    onSignOut: () => void;
    onSidebarSearchChange: (value: string) => void;
    onPatternSubmit: () => void;
}

export function DashboardSidebar({
    userName,
    userAvatar,
    filteredRepositories,
    loading,
    selectedRepos,
    batchMode,
    sidebarSearch,
    currentRepoKey,
    userStats,
    scanRepo,
    toggleRepoSelection,
    onSignOut,
    onSidebarSearchChange,
    onPatternSubmit,
}: DashboardSidebarProps) {
    return (
        <aside className="w-72 border-r border-white/10 flex flex-col bg-[#050505] z-50">
            {/* Brand & Profile */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg overflow-hidden bg-white/5 border border-white/10 p-1">
                        <img
                            src="/favicon.png"
                            alt="vulscany"
                            className="w-full h-full object-contain invert brightness-200"
                        />
                    </div>
                    <span className="font-mono font-bold tracking-tighter text-lg text-white">vulscany</span>
                </div>
                {userName && (
                    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                        {userAvatar ? (
                            <img src={userAvatar} alt={userName} className="w-5 h-5 rounded-full object-cover border border-white/20" />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/30">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="text-[10px] font-mono font-bold text-white/80 pr-1">{userName}</span>
                    </div>
                )}
            </div>

            {/* Sidebar Navigation / Search */}
            <div
                className="px-4 py-4 space-y-4 flex-grow overflow-y-auto custom-scrollbar"
                data-lenis-prevent
            >
                {/* Search Component */}
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Find repository..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs font-mono focus:outline-none focus:border-primary/50 transition-all"
                        value={sidebarSearch}
                        onChange={(e) => onSidebarSearchChange(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/20 border border-white/10 px-1 rounded">/</div>
                </div>

                {/* Achievements Summary Area */}
                {userStats && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest leading-none">Status</span>
                            <Trophy className="w-3 h-3 text-yellow-500/50" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                                <div className="text-xs font-bold text-white mb-0.5">{userStats.totalScans}</div>
                                <div className="text-[8px] text-white/40 uppercase">Scans</div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                                <div className="text-xs font-bold text-primary mb-0.5">{userStats.vulnerabilitiesFixed}</div>
                                <div className="text-[8px] text-white/40 uppercase">Fixed</div>
                            </div>
                        </div>
                        <AchievementsPanel stats={userStats} />
                    </div>
                )}

                {/* Repo List */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest leading-none">Projects</span>
                        <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{filteredRepositories.length}</span>
                    </div>

                    <div className="space-y-1" data-onboarding="repo-section">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="w-5 h-5 text-white/20 animate-spin" />
                            </div>
                        ) : filteredRepositories.length === 0 ? (
                            <div className="text-center py-8 text-[10px] font-mono text-white/20">No repositories found</div>
                        ) : (
                            filteredRepositories.map(repo => {
                                const isActive = currentRepoKey === `${repo.owner}/${repo.name}`;
                                return (
                                    <button
                                        key={repo.id}
                                        onClick={() => batchMode ? toggleRepoSelection(repo.id) : scanRepo(repo)}
                                        className={`w-full group text-left px-3 py-2 rounded-lg transition-all border flex items-center justify-between ${isActive
                                            ? 'bg-white/10 border-white/20 text-white'
                                            : 'bg-transparent border-transparent text-white/50 hover:bg-white/5 hover:text-white/80'
                                        } ${selectedRepos.has(repo.id) ? 'ring-1 ring-primary/50' : ''}`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${repo.scanStatus === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                                repo.scanStatus === 'issues' ? 'bg-amber-500' :
                                                    repo.scanStatus === 'safe' ? 'bg-emerald-500' :
                                                        'bg-white/20'
                                            }`} />
                                            <span className="text-xs font-medium truncate leading-none pt-0.5">{repo.name}</span>
                                        </div>
                                        {repo.issueCount !== undefined && repo.issueCount > 0 && (
                                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${repo.scanStatus === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                                            }`}>
                                                {repo.issueCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                <CommunityPatternsPanel onPatternSubmit={onPatternSubmit} />
            </div>

            {/* Sidebar Bottom */}
            <div className="p-4 border-t border-white/5 space-y-2">
                <button
                    onClick={onSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
