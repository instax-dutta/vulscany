/**
 * VullScanny Dashboard - Clean & Functional
 */

'use client';

import './mobile-responsive.css';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import ReactMarkdown from 'react-markdown';
import {
    LayoutDashboard,
    Shield,
    Zap,
    Cpu,
    History,
    Trophy,
    BookOpen,
    Users,
    Settings,
    Search,
    Github,
    LogOut,
    Menu,
    X,
    ChevronRight,
    AlertTriangle,
    CheckCircle2,
    ExternalLink,
    RefreshCw,
    Play,
    Terminal,
    Box
} from "lucide-react";
import rehypeSanitize from 'rehype-sanitize';
import type { Vulnerability } from '@/lib/scanner';
import Onboarding from '@/components/Onboarding';
import {
    SecurityScoreWidget,
    AchievementsPanel,
    EducationPanel,
    CommunityPatternsPanel,
    SecurityTipBanner
} from '@/components/DashboardFeatures';
import { loadUserStats, saveUserStats, updateStatsAfterScan, updateStatsAfterFix, calculateScore, type UserStats } from '@/lib/security-score';
import { ToastNotifications, useToast } from '@/components/ToastNotification';



interface ExtendedVulnerability extends Vulnerability {
    aiAnalysis?: {
        explanation?: {
            technicalDetails?: string;
            rootCause?: string;
            impact?: string;
        };
        fixSuggestion?: string;
    };
}

interface ScanResult {
    repoName: string;
    owner: string;
    scanTimestamp: string;
    stackInfo: any;
    vulnerabilities: ExtendedVulnerability[];
    status: 'safe' | 'needs-attention' | 'high-risk';
    summary: string;
    threatIntelligence?: {
        riskScore: number;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        cveCount: number;
        advisoryCount: number;
        criticalThreats: number;
        recommendations: string[];
        displayInUI?: boolean;
    };
}

interface Repository {
    id: number;
    name: string;
    owner: string;
    private: boolean;
    language: string | null;
    scanStatus?: 'pending' | 'scanning' | 'safe' | 'issues' | 'critical';
    issueCount?: number;
}

export default function Dashboard() {
    const router = useRouter();
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [loading, setLoading] = useState(true);
    const [batchMode, setBatchMode] = useState(false);
    const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());
    const [scanning, setScanning] = useState(false);
    const [scanResults, setScanResults] = useState<Record<string, ScanResult>>({});
    const [currentRepoKey, setCurrentRepoKey] = useState<string | null>(null);
    const [expandedVulns, setExpandedVulns] = useState<Record<string, boolean>>({});
    const [codeExpanded, setCodeExpanded] = useState<Record<string, boolean>>({});
    const [loadingAnalysis, setLoadingAnalysis] = useState<Record<string, boolean>>({});

    // Auto-Fix PR state
    const [generatingPR, setGeneratingPR] = useState(false);
    const [prResult, setPrResult] = useState<{ prUrl: string; prNumber: number; branch: string } | null>(null);
    const [showPRSuccess, setShowPRSuccess] = useState(false);

    // Copy fix snippets state
    const [copiedFix, setCopiedFix] = useState<Record<string, boolean>>({});

    // Onboarding state
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [userName, setUserName] = useState('');
    const [demoScanResults, setDemoScanResults] = useState<Record<string, any> | null>(null);

    // New Feature States
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [simpleEducationMode, setSimpleEducationMode] = useState(true);

    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [sidebarSearch, setSidebarSearch] = useState('');
    const { toasts, showToast, dismissToast, showSuccess, showAchievement, showSecurityWin } = useToast();



    // Check if user has completed onboarding
    useEffect(() => {
        const onboardingComplete = localStorage.getItem('vulscany_onboarding_complete');
        const savedName = localStorage.getItem('vulscany_user_name');

        if (!onboardingComplete) {
            setShowOnboarding(true);
        } else if (savedName) {
            setUserName(savedName);
        }
    }, []);

    // Load user stats
    useEffect(() => {
        let stats = loadUserStats();
        // Emergency cleanup: if stats were inflated by the previous infinite loop bug
        if (stats.totalScans > 1000000) {
            stats.totalScans = Math.min(stats.reposScanned || 1, 10); // Reset to something sane
            saveUserStats(stats);
        }
        setUserStats(stats);
    }, []);

    // Fetch user session for avatar
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch('/api/auth/session');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user?.avatar_url) {
                        setUserAvatar(data.user.avatar_url);
                        // If they haven't set a name in onboarding, use GitHub name/login
                        if (!userName && (data.user.name || data.user.login)) {
                            setUserName(data.user.name || data.user.login);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to fetch session:', err);
            }
        };
        fetchSession();
    }, [userName]);


    // Lenis is handled by SmoothScroll at the root layout


    // Auto-select demo repo when demo data is injected
    useEffect(() => {
        if (demoScanResults && Object.keys(demoScanResults).length > 0) {
            setCurrentRepoKey(Object.keys(demoScanResults)[0]);
        }
    }, [demoScanResults]);

    useEffect(() => {
        fetchRepos();
    }, []);

    const fetchRepos = async () => {
        try {
            const res = await fetch('/api/repos/webapp');
            const data = await res.json();
            setRepositories((data.repositories || []).map((r: any) => ({
                ...r,
                scanStatus: 'pending'
            })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const scanRepo = async (repo: Repository, force: boolean = false) => {
        const key = `${repo.owner}/${repo.name}`;
        setCurrentRepoKey(key);
        updateRepoStatus(repo.id, 'scanning');
        setScanning(true);
        setMasterPrompt(null); // Clear previous prompt when starting new scan

        try {
            const res = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    owner: repo.owner,
                    repo: repo.name,
                    force // Pass force parameter to bypass cache
                })
            });
            const data = await res.json();

            // Store scan result with cache metadata
            const scanResultWithMeta = {
                ...data.scanResult,
                _cached: data.cached || false,
                _cacheTimestamp: data.cacheTimestamp
            };

            setScanResults(prev => ({ ...prev, [key]: scanResultWithMeta }));
            setCurrentRepoKey(key);

            const status = data.scanResult.vulnerabilities.length === 0 ? 'safe' :
                data.scanResult.status === 'high-risk' ? 'critical' : 'issues';
            updateRepoStatus(repo.id, status, data.scanResult.vulnerabilities.length);

            // Update user stats (only for real scans, not cached ones)
            if (!data.cached && userStats) {
                const calculatedScore = calculateScore(data.scanResult.vulnerabilities);
                const updated = updateStatsAfterScan(
                    userStats,
                    repo.name,
                    calculatedScore,
                    data.scanResult.vulnerabilities.length
                );
                setUserStats(updated);
                saveUserStats(updated);
            }

            // Show cache notification if applicable
            if (data.cached) {
                showToast({ type: 'info', title: 'CACHE HIT', message: `Loaded scan from ${new Date(data.cacheTimestamp).toLocaleTimeString()}`, icon: '⚡' });
            } else {
                showSuccess('Scan Complete', `Found ${data.scanResult.vulnerabilities.length} issues in ${repo.name}`);
            }
        } catch (err) {
            updateRepoStatus(repo.id, 'pending');
        } finally {
            setScanning(false);
        }
    };

    const updateRepoStatus = (id: number, status: Repository['scanStatus'], count?: number) => {
        setRepositories(prev => prev.map(r =>
            r.id === id ? { ...r, scanStatus: status, issueCount: count } : r
        ));
    };

    const toggleRepoSelection = (id: number) => {
        setSelectedRepos(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else if (newSet.size < 10) newSet.add(id);
            return newSet;
        });
    };

    const scanBatch = async () => {
        const selected = repositories.filter(r => selectedRepos.has(r.id));
        setScanning(true);

        for (const repo of selected) {
            await scanRepo(repo);
        }

        setScanning(false);
        setSelectedRepos(new Set());
    };

    const getAiFix = async (vuln: ExtendedVulnerability, repoKey: string) => {
        const vulnId = `${repoKey}-${vuln.id}`;
        setLoadingAnalysis(prev => ({ ...prev, [vulnId]: true }));
        const currentRepo = scanResults[repoKey];

        try {
            const res = await fetch('/api/ai/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: vuln.file,
                    codeSnippet: vuln.snippet || '',
                    issueType: vuln.title,
                    vulnerableCode: vuln.snippet,
                    techStack: {
                        stack: currentRepo.stackInfo.stack,
                        version: currentRepo.stackInfo.version,
                        isNextJS: currentRepo.stackInfo.isNextJS,
                        hasTypeScript: currentRepo.stackInfo.hasTypeScript
                    }
                })
            });
            const data = await res.json();

            setScanResults(prev => ({
                ...prev,
                [repoKey]: {
                    ...prev[repoKey],
                    vulnerabilities: prev[repoKey].vulnerabilities.map(v =>
                        v.id === vuln.id ? { ...v, aiAnalysis: data } : v
                    )
                }
            }));
            setExpandedVulns(prev => ({ ...prev, [vulnId]: true }));
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAnalysis(prev => ({ ...prev, [vulnId]: false }));
        }
    };

    const [masterPrompt, setMasterPrompt] = useState<string | null>(null);
    const [generatingMaster, setGeneratingMaster] = useState(false);

    const generateMasterFix = async (repoKey: string) => {
        const repo = scanResults[repoKey];
        if (!repo) return;

        setGeneratingMaster(true);
        try {
            const res = await fetch('/api/ai/batch-fix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repoName: repo.repoName,
                    vulnerabilities: repo.vulnerabilities,
                    techStack: repo.stackInfo
                })
            });
            const data = await res.json();
            setMasterPrompt(data.prompt);
        } catch (err) {
            console.error(err);
        } finally {
            setGeneratingMaster(false);
        }
    };

    // Auto-Fix PR Generation
    const generateAutoFixPR = async (repoKey: string) => {
        const repo = scanResults[repoKey];
        if (!repo || repo.vulnerabilities.length === 0) return;

        setGeneratingPR(true);
        setPrResult(null);

        try {
            const res = await fetch('/api/ai/generate-pr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    owner: repo.owner,
                    repo: repo.repoName,
                    vulnerabilities: repo.vulnerabilities,
                    mode: 'create'
                })
            });

            const data = await res.json();

            if (data.success && data.prUrl) {
                setPrResult({
                    prUrl: data.prUrl,
                    prNumber: data.prNumber,
                    branch: data.branch
                });
                setShowPRSuccess(true);
                showSecurityWin();

                // Update user stats - increment fix count
                if (userStats) {
                    const updated = updateStatsAfterFix(userStats, repo.vulnerabilities.length);
                    setUserStats(updated);
                    saveUserStats(updated);
                }
            } else {
                showToast({ type: 'warning', title: 'PR FAILED', message: data.error || 'Unknown error', icon: '⚠️' });
            }
        } catch (error) {
            console.error('Auto-fix PR error:', error);
            alert('Failed to create auto-fix PR. Please try again.');
        } finally {
            setGeneratingPR(false);
        }
    };


    // Navigation for results
    const filteredRepositories = repositories.filter(repo =>
        repo.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
        repo.owner.toLowerCase().includes(sidebarSearch.toLowerCase())
    );

    const navigateResults = (direction: 'next' | 'prev') => {
        const keys = Object.keys(displayScanResults);
        const currentIndex = keys.indexOf(currentRepoKey!);
        const newIndex = direction === 'next' ?
            (currentIndex + 1) % keys.length :
            (currentIndex - 1 + keys.length) % keys.length;
        setCurrentRepoKey(keys[newIndex]);
    };

    // Merge demo data with real scan results during onboarding
    const displayScanResults = demoScanResults ? { ...scanResults, ...demoScanResults } : scanResults;
    const currentResult = currentRepoKey ? displayScanResults[currentRepoKey] : null;
    const pendingCount = repositories.filter(r => r.scanStatus === 'pending').length;
    const scannedCount = repositories.filter(r => r.scanStatus !== 'pending').length;

    return (
        <div className="flex h-screen w-full bg-[#000] text-foreground overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/10 flex flex-col bg-[#050505] z-50">
                {/* Brand & Profile */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg overflow-hidden bg-white/5 border border-white/10 p-1">
                            <img
                                src="https://mirror.sdad.pro/vulscany-logo-nobg.png"
                                alt="AEGLYN"
                                className="w-full h-full object-contain invert brightness-200"
                            />
                        </div>
                        <span className="font-mono font-bold tracking-tighter text-lg text-white">AEGLYN</span>
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
                            onChange={(e) => setSidebarSearch(e.target.value)}
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

                    <CommunityPatternsPanel onPatternSubmit={() => { }} />
                </div>

                {/* Sidebar Bottom */}
                <div className="p-4 border-t border-white/5 space-y-2">
                    <button
                        onClick={() => { fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                    >
                        <LogOut className="w-3 h-3" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#000] relative">
                {/* Top Sticky Nav */}
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
                            onClick={() => setBatchMode(!batchMode)}
                            className={`px-3 py-1.5 text-[10px] font-bold font-mono rounded-lg border transition-all ${batchMode
                                ? 'bg-primary text-black border-primary'
                                : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                                }`}
                        >
                            {batchMode ? 'BATCH ACTIVE' : 'BATCH MODE'}
                        </button>
                        {batchMode && selectedRepos.size > 0 && (
                            <button
                                onClick={scanBatch}
                                disabled={scanning}
                                className="px-3 py-1.5 text-[10px] font-bold font-mono rounded-lg bg-white text-black hover:bg-white/90 transition-all disabled:opacity-50"
                            >
                                SCAN {selectedRepos.size}
                            </button>
                        )}
                    </div>
                </nav>

                <div
                    className="flex-1 overflow-y-auto custom-scrollbar"
                    data-lenis-prevent
                >
                    <div className="max-w-6xl mx-auto p-8 space-y-8">
                        <SecurityTipBanner />


                        {/* Results Panel */}
                        <div data-onboarding="results-panel" className="space-y-6">
                            {scanning && !currentResult ? (
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
                            ) : null}

                            {currentResult && (
                                <>
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {/* Sub-header with Stats */}
                                        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                                            <div>
                                                <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                                                    {currentRepoKey?.split('/')[1] || 'Scan Results'}
                                                </h2>
                                                <div className="flex items-center gap-4 text-xs font-mono text-white/40">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        <span>Last scan: {currentResult._cached ? new Date(currentResult._cacheTimestamp).toLocaleTimeString() : 'Just now'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Box className="w-3 h-3" />
                                                        <span>{currentResult.vulnerabilities.length} Issues Detected</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <SecurityScoreWidget
                                                    vulnerabilities={currentResult.vulnerabilities}
                                                />
                                                <button
                                                    onClick={() => generateMasterFix(currentRepoKey!)}
                                                    disabled={generatingMaster || currentResult.vulnerabilities.length === 0}
                                                    className="h-10 px-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-xs font-bold font-mono text-primary flex items-center gap-2 transition-all disabled:opacity-50"
                                                >
                                                    <Cpu className={`w-3.5 h-3.5 ${generatingMaster ? 'animate-spin' : ''}`} />
                                                    MASTER FIX
                                                </button>
                                                <button
                                                    onClick={() => scanRepo({ id: currentResult!.repoName, owner: currentResult!.owner, name: currentResult!.repoName } as any, true)}
                                                    className="h-10 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold font-mono text-white flex items-center gap-2 transition-all"
                                                >
                                                    <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                                                    RESCAN
                                                </button>
                                            </div>
                                        </header>

                                        {/* AIPR Generation Prompt Area */}
                                        {currentResult.vulnerabilities.length > 0 && (
                                            <div data-onboarding="auto-fix-area" className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
                                                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-primary">
                                                            <Zap className="w-4 h-4 fill-primary" />
                                                            <span className="text-xs font-bold font-mono uppercase tracking-widest">AI Correction Protocol</span>
                                                        </div>
                                                        <h3 className="text-lg font-bold text-white">Automate Security Remediation</h3>
                                                        <p className="text-sm text-white/50 max-w-lg">
                                                            Our AI agent can generate a comprehensive patch covering all {currentResult.vulnerabilities.length} detected vulnerabilities in a single pull request.
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => generateAutoFixPR(currentRepoKey!)}
                                                        disabled={generatingPR}
                                                        className="w-full md:w-auto px-6 py-3 bg-primary text-black font-bold font-mono text-sm rounded-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                                                    >
                                                        {generatingPR ? 'ENGINEERING PATCH...' : 'GENERATE AUTO-FIX PR →'}
                                                    </button>
                                                </div>
                                                <div className="absolute right-[-10%] top-[-50%] w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-colors duration-700" />
                                            </div>
                                        )}

                                        {/* Vulnerabilities List */}
                                        <div className="space-y-4">
                                            {currentResult.vulnerabilities.length > 0 ? (
                                                currentResult.vulnerabilities.map((vuln: ExtendedVulnerability, vIdx: number) => {
                                                    const vulnKey = `${currentRepoKey}-${vuln.id || vIdx}`;
                                                    const isExpanded = expandedVulns[vulnKey];
                                                    const isAnalyzing = loadingAnalysis[vulnKey];
                                                    return (
                                                        <div key={vIdx} className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-colors">
                                                            {/* Vuln Header */}
                                                            <div className="p-6 flex items-start justify-between gap-4 border-b border-transparent group-hover:border-white/5 transition-colors">
                                                                <div className="flex items-start gap-4">
                                                                    <div className={`mt-1 p-2 rounded-lg ${vuln.severity === 'critical' ? 'bg-red-500/10 text-red-500' :
                                                                        vuln.severity === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                                                            'bg-amber-500/10 text-amber-500'
                                                                        }`}>
                                                                        <AlertTriangle className="w-5 h-5" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                            <span className="text-lg font-bold text-white leading-tight truncate max-w-[300px]">{vuln.title}</span>
                                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-tighter uppercase ${vuln.severity === 'critical' ? 'bg-red-500 text-white' :
                                                                                vuln.severity === 'high' ? 'bg-orange-500 text-white' :
                                                                                    'bg-amber-500 text-black'
                                                                                }`}>
                                                                                {vuln.severity}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-3 text-[10px] font-mono text-white/40">
                                                                            <span className="flex items-center gap-1.5 shrink-0"><Terminal className="w-3 h-3" /> {vuln.file}:{vuln.line}</span>
                                                                            <span className="w-1 h-1 bg-white/10 rounded-full shrink-0" />
                                                                            <span className="truncate">{vuln.type.toUpperCase()}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    onClick={() => {
                                                                        const nextState = !isExpanded;
                                                                        setExpandedVulns(prev => ({ ...prev, [vulnKey]: nextState }));
                                                                        if (nextState && !vuln.aiAnalysis && !isAnalyzing) {
                                                                            getAiFix(vuln, currentRepoKey!);
                                                                        }
                                                                    }}
                                                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors shrink-0"
                                                                >
                                                                    <ChevronRight className={`w-5 h-5 text-white/40 transition-transform ${isExpanded ? 'rotate-90 text-white' : ''}`} />
                                                                </button>
                                                            </div>

                                                            {/* Expanded Details */}
                                                            <AnimatePresence>
                                                                {isExpanded && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        className="overflow-hidden"
                                                                    >
                                                                        <div className="p-6 pt-2 space-y-6">
                                                                            {/* Code Context */}
                                                                            <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                                                                                <div className="px-3 py-1.5 bg-white/5 border-b border-white/5 text-[10px] font-mono text-white/40 flex items-center gap-2">
                                                                                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                                                                    VULNERABLE SNIPPET
                                                                                </div>
                                                                                <pre className="p-4 text-xs font-mono text-red-200/70 overflow-x-auto custom-scrollbar">
                                                                                    <code>{vuln.snippet}</code>
                                                                                </pre>
                                                                            </div>

                                                                            {/* AI Analysis */}
                                                                            <div className="grid lg:grid-cols-2 gap-6">
                                                                                <div className="space-y-4 min-w-0">
                                                                                    <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-primary uppercase tracking-widest">
                                                                                        <Cpu className="w-3.5 h-3.5" /> Technical Analysis
                                                                                    </div>
                                                                                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 prose prose-invert prose-sm max-w-none text-white/60 font-mono text-[13px] leading-relaxed overflow-x-auto custom-scrollbar">
                                                                                        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                                                                                            {vuln.aiAnalysis?.explanation?.technicalDetails || (isAnalyzing ? 'AI analysis in progress...' : 'Detailed analysis not started.')}
                                                                                        </ReactMarkdown>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="space-y-4 min-w-0">
                                                                                    <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-emerald-400 uppercase tracking-widest">
                                                                                        <Zap className="w-3.5 h-3.5" /> Patch Recommendation
                                                                                    </div>
                                                                                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 overflow-x-auto custom-scrollbar">
                                                                                        <div className="prose prose-emerald prose-invert prose-sm max-w-none text-emerald-100/80 font-mono text-[13px] leading-relaxed">
                                                                                            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                                                                                                {vuln.aiAnalysis?.fixSuggestion || (isAnalyzing ? 'Generating recommendation...' : 'Fix suggestion pending...')}
                                                                                            </ReactMarkdown>
                                                                                        </div>
                                                                                        {vuln.aiAnalysis?.fixSuggestion && (
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    const fix = vuln.aiAnalysis?.fixSuggestion;
                                                                                                    if (fix) {
                                                                                                        navigator.clipboard.writeText(fix);
                                                                                                        setCopiedFix({ ...copiedFix, [vulnKey]: true });
                                                                                                        setTimeout(() => setCopiedFix({ ...copiedFix, [vulnKey]: false }), 2000);
                                                                                                    }
                                                                                                }}
                                                                                                className={`mt-4 w-full py-2.5 rounded-lg text-[10px] font-bold font-mono flex items-center justify-center gap-2 transition-all ${copiedFix[vulnKey] ? 'bg-emerald-500 text-black' : 'bg-white/10 text-emerald-400 hover:bg-emerald-500/10'
                                                                                                    }`}
                                                                                            >
                                                                                                {copiedFix[vulnKey] ? (
                                                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                                                ) : (
                                                                                                    <History className="w-3.5 h-3.5" />
                                                                                                )}
                                                                                                {copiedFix[vulnKey] ? 'COPIED TO CLIPBOARD' : 'COPY PATCH SNIPPET'}
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <EducationPanel
                                                                                vulnerabilityType={vuln.type}
                                                                                isSimpleMode={simpleEducationMode}
                                                                            />
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-24 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-[32px] text-center px-6">
                                                    <div className="w-16 h-16 bg-emerald-500/10 flex items-center justify-center rounded-2xl mb-6">
                                                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white mb-2">Codebase is Protected</h3>
                                                    <p className="text-sm text-white/40 font-mono max-w-sm uppercase tracking-tight">Zero security vulnerabilities have been detected in this audit cycle.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Threat Intelligence Panel */}
                                        {currentResult.threatIntelligence && (currentResult.threatIntelligence as any).displayInUI !== false && (
                                            <div className="mt-8 bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                                            <Shield className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-white tracking-tight">Threat Intelligence</h3>
                                                            <p className="text-xs font-mono text-white/40 uppercase tracking-widest">Advanced Risk Profiling</p>
                                                        </div>
                                                    </div>
                                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold font-mono tracking-widest border ${currentResult.threatIntelligence.riskLevel === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                                        'bg-primary/10 border-primary/20 text-primary'
                                                        }`}>
                                                        {currentResult.threatIntelligence.riskLevel} RISK
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-3 gap-8">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-mono text-white/40">RISK INDEX</span>
                                                            <span className="text-2xl font-black text-white">{currentResult.threatIntelligence.riskScore}%</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary transition-all duration-1000 ease-out"
                                                                style={{ width: `${currentResult.threatIntelligence.riskScore}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 col-span-2">
                                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                            <div className="text-[10px] font-mono text-white/40 uppercase mb-1">CVE Identifiers</div>
                                                            <div className="text-xl font-bold text-white">{currentResult.threatIntelligence.cveCount}</div>
                                                        </div>
                                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                            <div className="text-[10px] font-mono text-white/40 uppercase mb-1">Security Advisories</div>
                                                            <div className="text-xl font-bold text-white">{currentResult.threatIntelligence.advisoryCount}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Master Prompt Sidebar/Modal Trigger? No, let's keep it as a box */}
                                        <AnimatePresence>
                                            {masterPrompt && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-8 bg-[#0F0F1A] border-2 border-primary/30 rounded-3xl p-8 relative overflow-hidden"
                                                >
                                                    <div className="relative z-10">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                                                                <Terminal className="w-5 h-5" /> Master Fix Prompt
                                                            </h3>
                                                            <div className="flex gap-3">
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(masterPrompt);
                                                                        showToast({ type: 'success', title: 'COPIED', message: 'Ready for AI IDE', icon: '📋' });
                                                                    }}
                                                                    className="px-4 py-2 bg-primary text-black text-xs font-bold font-mono rounded-lg hover:scale-105 active:scale-95 transition-all"
                                                                >
                                                                    COPY PROMPT
                                                                </button>
                                                                <button
                                                                    onClick={() => setMasterPrompt(null)}
                                                                    className="px-4 py-2 bg-white/10 text-white text-xs font-bold font-mono rounded-lg hover:bg-white/20 transition-all"
                                                                >
                                                                    CLOSE
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="bg-black/40 rounded-2xl p-6 border border-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                                                            <div className="prose prose-invert prose-sm max-w-none text-white/60 font-mono text-[13px]">
                                                                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                                                                    {masterPrompt}
                                                                </ReactMarkdown>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </>
                            )}

                            {!currentResult && !scanning && (
                                <div className="flex flex-col items-center justify-center py-40 bg-white/[0.01] border border-white/5 border-dashed rounded-[40px]">
                                    <div className="w-20 h-20 bg-white/5 flex items-center justify-center rounded-full mb-8">
                                        <Search className="w-8 h-8 text-white/20" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Select a Project</h3>
                                    <p className="text-white/40 text-sm font-mono max-w-xs text-center leading-relaxed">
                                        Choose a repository from the left sidebar to initiate a deep security audit.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals & Overlays */}
            <AnimatePresence>
                {showPRSuccess && prResult && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
                        onClick={() => setShowPRSuccess(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-10 max-w-xl w-full text-center relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-primary/10 flex items-center justify-center rounded-3xl mx-auto mb-8">
                                    <Shield className="w-12 h-12 text-primary fill-primary/20" />
                                </div>
                                <h2 className="text-3xl font-black text-white tracking-tighter mb-4 uppercase">PR GENERATED</h2>
                                <p className="text-white/50 text-base font-mono mb-8 leading-relaxed px-4">
                                    The security patch for <span className="text-white">{currentRepoKey}</span> is ready for review.
                                </p>

                                <div className="space-y-4">
                                    <a
                                        href={prResult.prUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full py-4 bg-white text-black font-black font-mono text-sm rounded-2xl hover:bg-white/90 active:scale-[0.98] transition-all"
                                    >
                                        VIEW PULL REQUEST →
                                    </a>
                                    <button
                                        onClick={() => setShowPRSuccess(false)}
                                        className="block w-full py-4 text-white/40 hover:text-white text-xs font-bold font-mono tracking-widest transition-colors uppercase"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-white to-primary/50" />
                        </motion.div>
                    </motion.div>
                )}

                {showOnboarding && (
                    <Onboarding
                        onComplete={() => setShowOnboarding(false)}
                        onDemoDataChange={setDemoScanResults}
                    />
                )}
            </AnimatePresence>

            <ToastNotifications toasts={toasts} onDismiss={dismissToast} />
        </div>
    );
}
