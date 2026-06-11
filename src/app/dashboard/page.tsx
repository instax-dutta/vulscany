/**
 * vulscany Dashboard - Clean & Functional
 */

'use client';

import './mobile-responsive.css';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { Box, Cpu, RefreshCw, Zap } from 'lucide-react';
import { type WebAppProjectInfo } from '@/lib/github/stack-detector';
import type { Vulnerability } from '@/lib/scanner';
import Onboarding from '@/components/Onboarding';
import {
    SecurityScoreWidget,
    SecurityTipBanner
} from '@/components/DashboardFeatures';
import { ThreatIntelligencePanel } from '@/components/ThreatIntelligencePanel';
import { MasterFixDrawer } from '@/components/MasterFixDrawer';
import { DashboardErrorBoundary } from '@/components/DashboardErrorBoundary';
import { loadUserStats, saveUserStats, loadUserStatsFromCloud, syncUserStatsToCloud, updateStatsAfterScan, updateStatsAfterFix, calculateScore, type UserStats } from '@/lib/security-score';
import { ToastNotifications, useToast } from '@/components/ToastNotification';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { VulnerabilityCard } from '@/components/dashboard/VulnerabilityCard';
import { ScanEmptyStates } from '@/components/dashboard/ScanEmptyStates';
import { PRSuccessModal } from '@/components/dashboard/PRSuccessModal';



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
    stackInfo: WebAppProjectInfo;
    vulnerabilities: ExtendedVulnerability[];
    status: 'safe' | 'needs-attention' | 'high-risk';
    summary: string;
    threatIntelligence?: {
        riskScore: number;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        cveCount: number;
        advisoryCount: number;
        scanFindingsCount?: number;
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

function Dashboard() {
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

    // Master Fix Prompt state
    const [masterPrompt, setMasterPrompt] = useState<string | null>(null);
    const [generatingMaster, setGeneratingMaster] = useState(false);
    const [isMasterDrawerOpen, setIsMasterDrawerOpen] = useState(false);

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
        const fetchStats = async () => {
            // Try cloud first
            const cloudStats = await loadUserStatsFromCloud();

            if (cloudStats) {
                setUserStats(cloudStats);
                // Also update local for offline/fallback
                saveUserStats(cloudStats);
            } else {
                // Fallback to local
                const localStats = loadUserStats();

                // Emergency cleanup: if stats were inflated by the previous infinite loop bug
                if (localStats.totalScans > 1000000) {
                    localStats.totalScans = Math.min(localStats.reposScanned || 1, 10);
                    saveUserStats(localStats);
                }

                setUserStats(localStats);

                // If we have local stats but failed cloud load, try to sync ONE-TIME
                if (localStats.totalScans > 0) {
                    syncUserStatsToCloud(localStats);
                }
            }
        };
        fetchStats();
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

            // Handle session expiration
            if (res.status === 401) {
                showToast({
                    type: 'warning',
                    title: 'Session Expired',
                    message: 'Redirecting to login...',
                    icon: '🔒'
                });
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
                return;
            }

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();
            setRepositories((data.repositories || []).map((r: any) => ({
                ...r,
                scanStatus: 'pending'
            })));
        } catch (err) {
            console.error('[Dashboard] Failed to fetch repos:', err);
            showToast({
                type: 'warning',
                title: 'Load Failed',
                message: 'Unable to load repositories. Please refresh.',
                icon: '⚠️'
            });
        } finally {
            setLoading(false);
        }
    };

    const scanRepo = async (repo: Repository, force: boolean = false) => {
        const key = `${repo.owner}/${repo.name}`;
        setCurrentRepoKey(key);
        updateRepoStatus(repo.id, 'scanning');
        setScanning(true);
        setMasterPrompt(null);

        try {
            const res = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ owner: repo.owner, repo: repo.name, force })
            });

            if (res.status === 401) {
                showToast({ type: 'warning', title: 'Session Expired', message: 'Redirecting to login...', icon: '🔒' });
                setTimeout(() => { window.location.href = '/'; }, 2000);
                return;
            }

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || errorData.message || `HTTP ${res.status}`);
            }

            const data = await res.json();
            if (!data.scanResult) throw new Error('Invalid scan response format');

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

            // Update user stats
            if (!data.cached && userStats) {
                const calculatedScore = calculateScore(data.scanResult.vulnerabilities, data.scanResult.threatIntelligence);
                const updated = updateStatsAfterScan(userStats, repo.name, calculatedScore, data.scanResult.vulnerabilities.length);
                setUserStats(updated);
                saveUserStats(updated);
            }

            if (data.cached) {
                showToast({ type: 'info', title: 'CACHE HIT', message: `Loaded scan from ${new Date(data.cacheTimestamp).toLocaleTimeString()}`, icon: '⚡' });
            } else {
                const vulnCount = data.scanResult.vulnerabilities.length;
                const threatCount = data.scanResult.threatIntelligence?.cveCount || 0;
                const isThreatCritical = ['HIGH', 'CRITICAL'].includes(data.scanResult.threatIntelligence?.riskLevel);

                if (vulnCount > 0 || isThreatCritical) {
                    showToast({
                        type: 'warning',
                        title: 'Scan Complete',
                        message: `Detected ${vulnCount} code issues and ${threatCount} dependency threats.`,
                        icon: '🛡️'
                    });
                } else {
                    showSuccess('Scan Complete', `Project ${repo.name} is secure.`);
                }
            }
        } catch (err: any) {
            console.error('[Dashboard] Scan failed:', err);
            updateRepoStatus(repo.id, 'pending');
            showToast({ type: 'warning', title: 'Scan Failed', message: err.message || 'Unable to complete scan.', icon: '⚠️' });
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

    const generateMasterFix = async (repoKey: string) => {
        const repo = scanResults[repoKey];
        if (!repo) return;

        setGeneratingMaster(true);
        // Announce generation
        showToast({ type: 'info', title: 'PROTOCOL INITIATED', message: 'Generating master security patch...', icon: '🧠' });

        try {
            const res = await fetch('/api/ai/batch-fix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repoName: repo.repoName,
                    vulnerabilities: repo.vulnerabilities,
                    threatIntelligence: repo.threatIntelligence,
                    techStack: repo.stackInfo
                })
            });
            const data = await res.json();
            setMasterPrompt(data.prompt);
            setIsMasterDrawerOpen(true);
            showSuccess('Prompt Generated', 'Unified patch protocol is ready for review.');
        } catch (err) {
            console.error(err);
            showToast({ type: 'warning', title: 'PROCESS FAILED', message: 'Unable to generate master patch.', icon: '⚠️' });
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
            <DashboardSidebar
                userName={userName}
                userAvatar={userAvatar}
                filteredRepositories={filteredRepositories}
                loading={loading}
                selectedRepos={selectedRepos}
                batchMode={batchMode}
                sidebarSearch={sidebarSearch}
                currentRepoKey={currentRepoKey}
                userStats={userStats}
                scanRepo={scanRepo}
                toggleRepoSelection={toggleRepoSelection}
                onSignOut={() => { fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); }}
                onSidebarSearchChange={setSidebarSearch}
                onPatternSubmit={() => {}}
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#000] relative">
                {/* Top Sticky Nav */}
                <DashboardHeader
                    currentRepoKey={currentRepoKey}
                    batchMode={batchMode}
                    scanning={scanning}
                    selectedReposCount={selectedRepos.size}
                    onBatchModeToggle={() => setBatchMode(!batchMode)}
                    onScanBatch={scanBatch}
                />

                <div
                    className="flex-1 overflow-y-auto custom-scrollbar"
                    data-lenis-prevent
                >
                    <div className="max-w-6xl mx-auto p-8 space-y-8">
                        <SecurityTipBanner />


                        {/* Results Panel */}
                        <div data-onboarding="results-panel" className="space-y-6">
                            <ScanEmptyStates
                                scanning={scanning}
                                currentResult={currentResult}
                                currentRepoKey={currentRepoKey}
                            />

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
                                                    threatIntel={currentResult.threatIntelligence}
                                                />
                                                <button
                                                    onClick={() => generateMasterFix(currentRepoKey!)}
                                                    disabled={generatingMaster || (currentResult.vulnerabilities.length === 0 && (!currentResult.threatIntelligence || !['HIGH', 'CRITICAL'].includes(currentResult.threatIntelligence.riskLevel)))}
                                                    className={`h-10 px-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-xs font-bold font-mono text-primary flex items-center gap-2 transition-all disabled:opacity-50 ${(!generatingMaster && currentResult.vulnerabilities.length === 0 && currentResult.threatIntelligence && ['HIGH', 'CRITICAL'].includes(currentResult.threatIntelligence.riskLevel)) ? 'ring-2 ring-primary/40 animate-pulse' : ''}`}
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
                                                        <VulnerabilityCard
                                                            key={vIdx}
                                                            vuln={vuln}
                                                            vulnKey={vulnKey}
                                                            isExpanded={isExpanded}
                                                            isAnalyzing={isAnalyzing}
                                                            currentRepoKey={currentRepoKey!}
                                                            getAiFix={getAiFix}
                                                            onToggleExpand={() => {
                                                                const nextState = !isExpanded;
                                                                setExpandedVulns(prev => ({ ...prev, [vulnKey]: nextState }));
                                                                if (nextState && !vuln.aiAnalysis && !isAnalyzing) {
                                                                    getAiFix(vuln, currentRepoKey!);
                                                                }
                                                            }}
                                                            copiedFix={copiedFix}
                                                            onCopyFix={(fix) => {
                                                                navigator.clipboard.writeText(fix);
                                                                setCopiedFix(prev => ({ ...prev, [vulnKey]: true }));
                                                                setTimeout(() => setCopiedFix(prev => ({ ...prev, [vulnKey]: false })), 2000);
                                                            }}
                                                            simpleEducationMode={simpleEducationMode}
                                                        />
                                                    );
                                                })
                                            ) : (
                                                <ScanEmptyStates
                                                    scanning={scanning}
                                                    currentResult={currentResult}
                                                    currentRepoKey={currentRepoKey}
                                                />
                                            )}
                                        </div>

                                        {/* Threat Intelligence Panel */}
                                        {currentResult.threatIntelligence && currentResult.threatIntelligence.displayInUI !== false && (
                                            <div id="threat-intel-panel">
                                                <ThreatIntelligencePanel
                                                    threatData={currentResult.threatIntelligence}
                                                    repoName={currentRepoKey?.split('/')[1]}
                                                />
                                            </div>
                                        )}

                                    </div>
                                </>
                            )}


                        </div>
                    </div>
                </div>
            </main>

            {/* Modals & Overlays */}
            <AnimatePresence>
                <PRSuccessModal
                    show={showPRSuccess}
                    prResult={prResult}
                    currentRepoKey={currentRepoKey}
                    onDismiss={() => setShowPRSuccess(false)}
                />

                {showOnboarding && (
                    <Onboarding
                        onComplete={() => setShowOnboarding(false)}
                        onDemoDataChange={setDemoScanResults}
                    />
                )}

                <MasterFixDrawer
                    isOpen={isMasterDrawerOpen}
                    onClose={() => setIsMasterDrawerOpen(false)}
                    prompt={masterPrompt}
                    onCopy={() => showToast({ type: 'success', title: 'SYCHRONIZED', message: 'Payload ready for review', icon: '🚀' })}
                    repoName={currentRepoKey?.split('/')[1]}
                />
            </AnimatePresence>

            <ToastNotifications toasts={toasts} onDismiss={dismissToast} />
        </div>
    );
}

// Wrap with Error Boundary for graceful crash handling
export default function DashboardWithErrorBoundary() {
    return (
        <DashboardErrorBoundary>
            <Dashboard />
        </DashboardErrorBoundary>
    );
}
