/**
 * VullScanny Dashboard - Clean & Functional
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from '@studio-freight/lenis';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import type { Vulnerability } from '@/lib/scanner';

interface ScanResult {
    repoName: string;
    owner: string;
    scanTimestamp: string;
    reactInfo: any;
    vulnerabilities: Vulnerability[];
    status: 'safe' | 'needs-attention' | 'high-risk';
    summary: string;
    threatIntelligence?: {
        riskScore: number;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        cveCount: number;
        advisoryCount: number;
        criticalThreats: number;
        recommendations: string[];
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
    const [aiExpanded, setAiExpanded] = useState<Record<string, boolean>>({});
    const [codeExpanded, setCodeExpanded] = useState<Record<string, boolean>>({});
    const [loadingAnalysis, setLoadingAnalysis] = useState<Record<string, boolean>>({});

    // Auto-Fix PR state
    const [generatingPR, setGeneratingPR] = useState(false);
    const [prResult, setPrResult] = useState<{ prUrl: string; prNumber: number; branch: string } | null>(null);
    const [showPRSuccess, setShowPRSuccess] = useState(false);

    // Removed knowledgebase - no longer needed

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        return () => lenis.destroy();
    }, []);

    useEffect(() => {
        fetchRepos();
    }, []);

    const fetchRepos = async () => {
        try {
            const res = await fetch('/api/repos/react');
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

            // Show cache notification if applicable
            if (data.cached) {
                console.log(`[Dashboard] Loaded cached scan from ${data.cacheTimestamp}`);
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

    const getAiFix = async (vuln: Vulnerability, repoKey: string) => {
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
                        hasNext: currentRepo.reactInfo.hasNext,
                        reactVersion: currentRepo.reactInfo.reactVersion,
                        hasTypeScript: currentRepo.reactInfo.hasTypeScript
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
            setAiExpanded(prev => ({ ...prev, [vulnId]: true }));
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
                    techStack: repo.reactInfo
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



    const navigateResults = (direction: 'next' | 'prev') => {
        const keys = Object.keys(scanResults);
        const currentIndex = keys.indexOf(currentRepoKey!);
        const newIndex = direction === 'next' ?
            (currentIndex + 1) % keys.length :
            (currentIndex - 1 + keys.length) % keys.length;
        setCurrentRepoKey(keys[newIndex]);
    };

    const currentResult = currentRepoKey ? scanResults[currentRepoKey] : null;
    const pendingCount = repositories.filter(r => r.scanStatus === 'pending').length;
    const scannedCount = repositories.filter(r => r.scanStatus !== 'pending').length;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0f, #1a0a2e)', color: '#fff' }}>
            {/* Header */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'rgba(10, 10, 15, 0.95)',
                borderBottom: '2px solid rgba(0, 255, 136, 0.3)',
                backdropFilter: 'blur(20px)',
                padding: '1rem 2rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1800px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: '900',
                            background: 'linear-gradient(90deg, #00ff88, #00ccff)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontFamily: 'monospace'
                        }}>
                            VULLSCANNY
                        </h1>

                        <button
                            onClick={() => setBatchMode(!batchMode)}
                            style={{
                                background: batchMode ? 'linear-gradient(135deg, #ff0055, #ff5500)' : 'rgba(0, 255, 136, 0.1)',
                                border: `2px solid ${batchMode ? '#ff0055' : '#00ff88'}`,
                                color: batchMode ? '#fff' : '#00ff88',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontFamily: 'monospace'
                            }}
                        >
                            {batchMode ? '⚡ BATCH MODE' : '🎯 SINGLE MODE'}
                        </button>

                        {batchMode && selectedRepos.size > 0 && (
                            <button
                                onClick={scanBatch}
                                disabled={scanning}
                                style={{
                                    background: 'linear-gradient(135deg, #00ff88, #00ccff)',
                                    border: 'none',
                                    color: '#0a0a0f',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '900',
                                    cursor: scanning ? 'not-allowed' : 'pointer',
                                    fontFamily: 'monospace',
                                    opacity: scanning ? 0.5 : 1
                                }}
                            >
                                SCAN {selectedRepos.size} REPOS
                            </button>
                        )}


                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            fontSize: '0.75rem',
                            color: '#00ccff',
                            fontFamily: 'monospace'
                        }}>
                            {scannedCount}/{repositories.length} SCANNED
                        </div>
                        <button
                            onClick={() => { fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); }}
                            style={{
                                background: 'rgba(255, 0, 85, 0.15)',
                                border: '2px solid rgba(255, 0, 85, 0.5)',
                                color: '#ff0055',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontFamily: 'monospace'
                            }}
                        >
                            LOGOUT
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', padding: '1.5rem 2rem', maxWidth: '1800px', margin: '0 auto' }}>

                {/* Repository List / KB Sidebar */}
                <div
                    data-lenis-prevent
                    style={{
                        background: 'rgba(10, 10, 15, 0.6)',
                        border: '2px solid rgba(0, 255, 136, 0.3)',
                        borderRadius: '1rem',
                        padding: '1rem',
                        height: 'calc(100vh - 150px)',
                        overflow: 'auto'
                    }}
                >
                    {(
                        <>
                            <h3 style={{ fontSize: '0.875rem', color: '#00ff88', fontFamily: 'monospace', marginBottom: '1rem' }}>
                                REPOSITORIES ({repositories.length})
                            </h3>

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#00ccff' }}>Loading...</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {repositories.map(repo => (
                                        <button
                                            key={repo.id}
                                            onClick={() => batchMode ? toggleRepoSelection(repo.id) : scanRepo(repo)}
                                            style={{
                                                background: selectedRepos.has(repo.id) ? 'rgba(0, 255, 136, 0.2)' : 'rgba(10, 10, 15, 0.8)',
                                                border: `2px solid ${repo.scanStatus === 'critical' ? '#ff0055' :
                                                    repo.scanStatus === 'issues' ? '#ffaa00' :
                                                        repo.scanStatus === 'safe' ? '#00ff88' :
                                                            selectedRepos.has(repo.id) ? '#00ff88' :
                                                                'rgba(0, 255, 136, 0.2)'
                                                    }`,
                                                borderRadius: '0.5rem',
                                                padding: '0.75rem',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#00ff88', fontFamily: 'monospace' }}>
                                                    {repo.name}
                                                </span>
                                                {repo.scanStatus !== 'pending' && (
                                                    <span style={{ fontSize: '0.75rem', color: '#00ccff', fontFamily: 'monospace' }}>
                                                        {repo.scanStatus === 'scanning' ? '⏳' :
                                                            repo.scanStatus === 'safe' ? '✓' :
                                                                repo.scanStatus === 'issues' ? '⚠' :
                                                                    '⚠⚠'}
                                                    </span>
                                                )}
                                            </div>
                                            {repo.issueCount !== undefined && (
                                                <div style={{ fontSize: '0.625rem', color: '#666', fontFamily: 'monospace' }}>
                                                    {repo.issueCount} {repo.issueCount === 1 ? 'issue' : 'issues'}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Results Panel / KB Content */}
                <div
                    data-lenis-prevent
                    style={{
                        background: 'rgba(10, 10, 15, 0.6)',
                        border: '2px solid rgba(0, 255, 136, 0.3)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        height: 'calc(100vh - 150px)',
                        overflow: 'auto'
                    }}
                >
                    {scanning && !currentResult ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                            <div style={{ fontSize: '1rem', color: '#00ff88', fontFamily: 'monospace' }}>SCANNING...</div>
                        </div>
                    ) : null}

                    {currentResult && (
                        <>
                            {/* Navigation */}
                            {Object.keys(scanResults).length > 1 && (
                                <>
                                    <div style={{ marginBottom: '1rem', borderBottom: '2px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                                        <div style={{
                                            background: 'rgba(0, 255, 136, 0.2)',
                                            border: '2px solid #00ff88',
                                            color: '#00ff88',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.75rem',
                                            fontFamily: 'monospace',
                                            fontWeight: '800',
                                            textAlign: 'center'
                                        }}>
                                            🔍 SCAN RESULTS
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <button
                                            onClick={() => navigateResults('prev')}
                                            style={{
                                                background: 'rgba(0, 204, 255, 0.2)',
                                                border: '2px solid #00ccff',
                                                color: '#00ccff',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                fontFamily: 'monospace',
                                                fontWeight: '700'
                                            }}
                                        >
                                            ← PREV
                                        </button>
                                        <span style={{ fontSize: '0.75rem', color: '#00ccff', fontFamily: 'monospace' }}>
                                            {Object.keys(scanResults).indexOf(currentRepoKey!) + 1} / {Object.keys(scanResults).length}
                                        </span>
                                        <button
                                            onClick={() => navigateResults('next')}
                                            style={{
                                                background: 'rgba(0, 204, 255, 0.2)',
                                                border: '2px solid #00ccff',
                                                color: '#00ccff',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                fontFamily: 'monospace',
                                                fontWeight: '700'
                                            }}
                                        >
                                            NEXT →
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Result Header */}
                            <div style={{
                                background: currentResult.status === 'safe' ? 'rgba(0, 255, 136, 0.1)' :
                                    currentResult.status === 'high-risk' ? 'rgba(255, 0, 85, 0.1)' :
                                        'rgba(255, 170, 0, 0.1)',
                                border: `2px solid ${currentResult.status === 'safe' ? '#00ff88' :
                                    currentResult.status === 'high-risk' ? '#ff0055' : '#ffaa00'
                                    }`,
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                marginBottom: '1.5rem'
                            }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#00ff88', fontFamily: 'monospace', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {currentResult.repoName}
                                    {(currentResult as any)._cached && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{
                                                fontSize: '0.625rem',
                                                background: 'rgba(0, 204, 255, 0.2)',
                                                border: '1px solid #00ccff',
                                                color: '#00ccff',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.25rem',
                                                fontWeight: '700'
                                            }}>
                                                ⚡ CACHED ({new Date((currentResult as any)._cacheTimestamp || currentResult.scanTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                            </span>
                                            <button
                                                onClick={() => {
                                                    const repo = repositories.find(r => `${r.owner}/${r.name}` === currentRepoKey);
                                                    if (repo) scanRepo(repo, true);
                                                }}
                                                style={{
                                                    background: 'rgba(255,255,255,0.1)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    color: '#fff',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '0.25rem',
                                                    fontSize: '0.625rem',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}
                                            >
                                                🔄 REFRESH SCAN
                                            </button>
                                        </div>
                                    )}
                                </h2>
                                <p style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                                    {currentResult.summary}
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                                    {[
                                        { label: 'REACT', value: currentResult.reactInfo.reactVersion },
                                        { label: 'FRAMEWORK', value: currentResult.reactInfo.hasNext ? 'Next.js' : 'React' },
                                        { label: 'TYPESCRIPT', value: currentResult.reactInfo.hasTypeScript ? 'YES' : 'NO' },
                                        { label: 'ISSUES', value: currentResult.vulnerabilities.length }
                                    ].map((stat, i) => (
                                        <div key={i} style={{
                                            background: 'rgba(0, 0, 0, 0.3)',
                                            borderRadius: '0.5rem',
                                            padding: '0.75rem',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '0.625rem', color: '#666', marginBottom: '0.25rem', fontFamily: 'monospace' }}>{stat.label}</div>
                                            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#00ff88', fontFamily: 'monospace' }}>{stat.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Master Fix Action */}
                                {currentResult.vulnerabilities.length > 0 && (
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <button
                                            onClick={() => generateMasterFix(currentRepoKey!)}
                                            disabled={generatingMaster}
                                            style={{
                                                width: '100%',
                                                background: 'linear-gradient(90deg, #ff0055, #ff5500)',
                                                border: 'none',
                                                color: '#fff',
                                                padding: '0.75rem',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem',
                                                fontWeight: '900',
                                                cursor: generatingMaster ? 'not-allowed' : 'pointer',
                                                fontFamily: 'monospace',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                boxShadow: '0 4px 15px rgba(255, 0, 85, 0.3)'
                                            }}
                                        >
                                            {generatingMaster ? '🛠️ GENERATING MASTER PROMPT...' : '🚀 GENERATE MASTER FIX PROMPT'}
                                        </button>
                                        <p style={{ fontSize: '0.7rem', color: '#666', textAlign: 'center', marginTop: '0.5rem', fontFamily: 'monospace' }}>
                                            ONE-SHOT PROMPT FOR CURSOR / WINDSURF / COPILOT
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Master Prompt Display */}
                            <AnimatePresence>
                                {masterPrompt && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        style={{
                                            background: 'rgba(10, 10, 15, 0.95)',
                                            border: '2px solid #ff0055',
                                            borderRadius: '1rem',
                                            padding: '1.5rem',
                                            marginBottom: '1.5rem',
                                            position: 'relative',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: '900', color: '#ff0055', fontFamily: 'monospace' }}>
                                                🔥 MASTER ONE-SHOT PROMPT
                                            </h3>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(masterPrompt);
                                                        const btn = document.getElementById('copy-master');
                                                        if (btn) btn.innerText = 'COPIED!';
                                                        setTimeout(() => { if (btn) btn.innerText = 'COPY PROMPT'; }, 2000);
                                                    }}
                                                    id="copy-master"
                                                    style={{
                                                        background: '#ff0055',
                                                        border: 'none',
                                                        color: '#fff',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '0.4rem',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '800',
                                                        cursor: 'pointer',
                                                        fontFamily: 'monospace'
                                                    }}
                                                >
                                                    COPY PROMPT
                                                </button>
                                                <button
                                                    onClick={() => setMasterPrompt(null)}
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                        border: 'none',
                                                        color: '#fff',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '0.4rem',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '800',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    CLOSE
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{
                                            background: 'rgba(0,0,0,0.4)',
                                            padding: '1.5rem',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            color: '#cbd5e1',
                                            maxHeight: '500px',
                                            overflow: 'auto',
                                            fontFamily: 'monospace',
                                            lineHeight: '1.6',
                                            border: '1px solid rgba(255, 0, 85, 0.1)'
                                        }}>
                                            <ReactMarkdown
                                                rehypePlugins={[rehypeSanitize]}
                                                components={{
                                                    h1: ({ node, ...props }) => <h1 style={{ color: '#ff0055', fontSize: '1.25rem', fontWeight: '900', marginBottom: '1rem', borderBottom: '1px solid rgba(255,0,85,0.2)', paddingBottom: '0.5rem' }} {...props} />,
                                                    h2: ({ node, ...props }) => <h2 style={{ color: '#00ff88', fontSize: '1.1rem', fontWeight: '800', marginTop: '1.5rem', marginBottom: '0.75rem' }} {...props} />,
                                                    h3: ({ node, ...props }) => <h3 style={{ color: '#00ccff', fontSize: '1rem', fontWeight: '700', marginTop: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} {...props} />,
                                                    p: ({ node, ...props }) => <p style={{ marginBottom: '1rem' }} {...props} />,
                                                    ul: ({ node, ...props }) => <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }} {...props} />,
                                                    li: ({ node, ...props }) => <li style={{ marginBottom: '0.5rem' }} {...props} />,
                                                    code: ({ node, ...props }) => (
                                                        <code style={{
                                                            background: 'rgba(255, 255, 255, 0.05)',
                                                            padding: '0.2rem 0.4rem',
                                                            borderRadius: '4px',
                                                            color: '#ffaa00',
                                                            fontSize: '0.85em'
                                                        }} {...props} />
                                                    ),
                                                    pre: ({ node, ...props }) => (
                                                        <pre style={{
                                                            background: 'rgba(0,0,0,0.5)',
                                                            padding: '1rem',
                                                            borderRadius: '0.5rem',
                                                            overflow: 'auto',
                                                            marginBottom: '1rem',
                                                            border: '1px solid rgba(255,255,255,0.1)'
                                                        }} {...props} />
                                                    ),
                                                    strong: ({ node, ...props }) => <strong style={{ color: '#fff', fontWeight: '800' }} {...props} />
                                                }}
                                            >
                                                {masterPrompt}
                                            </ReactMarkdown>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Threat Intelligence Panel - Only display when displayInUI is true */}
                            {currentResult.threatIntelligence && (currentResult.threatIntelligence as any).displayInUI !== false && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05), rgba(0, 204, 255, 0.05))',
                                        border: '2px solid rgba(0, 255, 136, 0.3)',
                                        borderRadius: '1rem',
                                        padding: '1.5rem',
                                        marginBottom: '1.5rem'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ fontSize: '1.5rem' }}>🛡️</div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: '900', color: '#00ff88', fontFamily: 'monospace' }}>
                                                THREAT INTELLIGENCE
                                            </h3>
                                        </div>
                                        <div style={{
                                            background: currentResult.threatIntelligence.riskLevel === 'CRITICAL' ? 'rgba(255, 0, 85, 0.2)' :
                                                currentResult.threatIntelligence.riskLevel === 'HIGH' ? 'rgba(255, 170, 0, 0.2)' :
                                                    currentResult.threatIntelligence.riskLevel === 'MEDIUM' ? 'rgba(255, 200, 0, 0.2)' :
                                                        'rgba(0, 255, 136, 0.2)',
                                            border: `2px solid ${currentResult.threatIntelligence.riskLevel === 'CRITICAL' ? '#ff0055' :
                                                currentResult.threatIntelligence.riskLevel === 'HIGH' ? '#ffaa00' :
                                                    currentResult.threatIntelligence.riskLevel === 'MEDIUM' ? '#ffc800' :
                                                        '#00ff88'}`,
                                            borderRadius: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            fontFamily: 'monospace',
                                            fontWeight: '900',
                                            fontSize: '0.75rem',
                                            color: currentResult.threatIntelligence.riskLevel === 'CRITICAL' ? '#ff0055' :
                                                currentResult.threatIntelligence.riskLevel === 'HIGH' ? '#ffaa00' :
                                                    currentResult.threatIntelligence.riskLevel === 'MEDIUM' ? '#ffc800' :
                                                        '#00ff88'
                                        }}>
                                            {currentResult.threatIntelligence.riskLevel} RISK
                                        </div>
                                    </div>

                                    {/* Risk Score Visualization */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#666', fontFamily: 'monospace' }}>RISK SCORE</span>
                                            <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#00ff88', fontFamily: 'monospace' }}>
                                                {currentResult.threatIntelligence.riskScore}/100
                                            </span>
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: '8px',
                                            background: 'rgba(0, 0, 0, 0.3)',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${currentResult.threatIntelligence.riskScore}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                style={{
                                                    height: '100%',
                                                    background: currentResult.threatIntelligence.riskScore >= 75 ? 'linear-gradient(90deg, #ff0055, #ff5500)' :
                                                        currentResult.threatIntelligence.riskScore >= 50 ? 'linear-gradient(90deg, #ffaa00, #ffc800)' :
                                                            currentResult.threatIntelligence.riskScore >= 25 ? 'linear-gradient(90deg, #ffc800, #00ff88)' :
                                                                'linear-gradient(90deg, #00ff88, #00ccff)'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Threat Stats */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                        <div style={{
                                            background: 'rgba(0, 0, 0, 0.3)',
                                            borderRadius: '0.5rem',
                                            padding: '0.75rem',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '0.625rem', color: '#666', marginBottom: '0.25rem', fontFamily: 'monospace' }}>CVEs</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#00ccff', fontFamily: 'monospace' }}>
                                                {currentResult.threatIntelligence.cveCount}
                                            </div>
                                        </div>
                                        <div style={{
                                            background: 'rgba(0, 0, 0, 0.3)',
                                            borderRadius: '0.5rem',
                                            padding: '0.75rem',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '0.625rem', color: '#666', marginBottom: '0.25rem', fontFamily: 'monospace' }}>ADVISORIES</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#00ccff', fontFamily: 'monospace' }}>
                                                {currentResult.threatIntelligence.advisoryCount}
                                            </div>
                                        </div>
                                        <div style={{
                                            background: 'rgba(0, 0, 0, 0.3)',
                                            borderRadius: '0.5rem',
                                            padding: '0.75rem',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '0.625rem', color: '#666', marginBottom: '0.25rem', fontFamily: 'monospace' }}>CRITICAL</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ff0055', fontFamily: 'monospace' }}>
                                                {currentResult.threatIntelligence.criticalThreats}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recommendations */}
                                    {currentResult.threatIntelligence.recommendations.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#00ff88', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                                                SECURITY RECOMMENDATIONS
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {currentResult.threatIntelligence.recommendations.map((rec, i) => (
                                                    <div key={i} style={{
                                                        fontSize: '0.8125rem',
                                                        color: '#cbd5e1',
                                                        padding: '0.5rem',
                                                        background: 'rgba(0, 0, 0, 0.2)',
                                                        borderRadius: '0.375rem',
                                                        borderLeft: '3px solid #00ff88'
                                                    }}>
                                                        {rec}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Vulnerabilities */}
                            {currentResult.vulnerabilities.length > 0 ? (
                                <div>
                                    <h3 style={{ fontSize: '0.875rem', color: '#ff0055', fontFamily: 'monospace', marginBottom: '1rem' }}>
                                        VULNERABILITIES ({currentResult.vulnerabilities.length})
                                    </h3>
                                    {currentResult.vulnerabilities.map((vuln: any) => {
                                        const vulnKey = `${currentRepoKey}-${vuln.id}`;
                                        return (
                                            <div key={vuln.id} style={{
                                                background: 'rgba(255, 0, 85, 0.05)',
                                                border: '2px solid rgba(255, 0, 85, 0.3)',
                                                borderRadius: '0.75rem',
                                                padding: '1rem',
                                                marginBottom: '1rem'
                                            }}>
                                                <div style={{ marginBottom: '0.75rem' }}>
                                                    <div>
                                                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ff0055', marginBottom: '0.25rem' }}>
                                                            {vuln.title}
                                                        </h4>
                                                        <div style={{ fontSize: '0.75rem', color: '#666', fontFamily: 'monospace' }}>
                                                            {vuln.file} • {vuln.severity}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
                                                    {vuln.description}
                                                </p>

                                                {/* Action Buttons */}
                                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                                    <button
                                                        onClick={() => getAiFix(vuln, currentRepoKey!)}
                                                        disabled={loadingAnalysis[vulnKey]}
                                                        style={{
                                                            background: 'linear-gradient(135deg, #00ff88, #00ccff)',
                                                            border: 'none',
                                                            color: '#0a0a0f',
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '0.5rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '700',
                                                            cursor: loadingAnalysis[vulnKey] ? 'not-allowed' : 'pointer',
                                                            fontFamily: 'monospace',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            opacity: loadingAnalysis[vulnKey] ? 0.7 : 1
                                                        }}
                                                    >
                                                        {loadingAnalysis[vulnKey] ? (
                                                            <>
                                                                <motion.span
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                    style={{
                                                                        display: 'inline-block',
                                                                        width: '12px',
                                                                        height: '12px',
                                                                        border: '2px solid #0a0a0f',
                                                                        borderTopColor: 'transparent',
                                                                        borderRadius: '50%'
                                                                    }}
                                                                />
                                                                ANALYZING...
                                                            </>
                                                        ) : (
                                                            '🤖 GET AI FIX'
                                                        )}
                                                    </button>
                                                    {vuln.snippet && (
                                                        <button
                                                            onClick={() => setCodeExpanded(prev => ({ ...prev, [vulnKey]: !prev[vulnKey] }))}
                                                            style={{
                                                                background: 'rgba(255, 170, 0, 0.2)',
                                                                border: '2px solid #ffaa00',
                                                                color: '#ffaa00',
                                                                padding: '0.5rem 1rem',
                                                                borderRadius: '0.5rem',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '700',
                                                                cursor: 'pointer',
                                                                fontFamily: 'monospace'
                                                            }}
                                                        >
                                                            {codeExpanded[vulnKey] ? '🔼 HIDE CODE' : '👁️ VIEW CODE'}
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Code Snippet */}
                                                {vuln.snippet && codeExpanded[vulnKey] && (
                                                    <div style={{
                                                        background: 'rgba(10, 10, 15, 0.9)',
                                                        border: '2px solid rgba(255, 170, 0, 0.3)',
                                                        borderRadius: '0.5rem',
                                                        padding: '1rem',
                                                        marginBottom: '0.75rem',
                                                        overflow: 'auto',
                                                        maxHeight: '300px'
                                                    }}
                                                        data-lenis-prevent
                                                    >
                                                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ffaa00', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                                                            VULNERABLE CODE:
                                                        </div>
                                                        <pre style={{
                                                            margin: 0,
                                                            fontSize: '0.8125rem',
                                                            color: '#cbd5e1',
                                                            fontFamily: 'monospace',
                                                            lineHeight: 1.6,
                                                            whiteSpace: 'pre-wrap',
                                                            wordBreak: 'break-word'
                                                        }}>
                                                            {vuln.snippet}
                                                        </pre>
                                                    </div>
                                                )}

                                                {vuln.aiAnalysis && aiExpanded[vulnKey] && (
                                                    <div style={{
                                                        background: 'rgba(0, 255, 136, 0.05)',
                                                        border: '2px solid rgba(0, 255, 136, 0.3)',
                                                        borderRadius: '0.5rem',
                                                        padding: '1rem',
                                                        marginTop: '1rem'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                            <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#00ff88' }}>
                                                                AI ANALYSIS & VIBE PROMPT
                                                            </div>
                                                            {vuln.aiAnalysis.vibePrompt && (
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(vuln.aiAnalysis.vibePrompt);
                                                                        const btn = document.getElementById(`copy-${vulnKey}`);
                                                                        if (btn) btn.innerText = 'COPIED!';
                                                                        setTimeout(() => { if (btn) btn.innerText = 'COPY FIX PROMPT'; }, 2000);
                                                                    }}
                                                                    id={`copy-${vulnKey}`}
                                                                    style={{
                                                                        background: 'rgba(0, 255, 136, 0.2)',
                                                                        border: '1px solid #00ff88',
                                                                        color: '#00ff88',
                                                                        padding: '0.25rem 0.5rem',
                                                                        borderRadius: '0.3rem',
                                                                        fontSize: '0.625rem',
                                                                        fontWeight: '800',
                                                                        cursor: 'pointer',
                                                                        fontFamily: 'monospace'
                                                                    }}
                                                                >
                                                                    COPY FIX PROMPT
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Vibe Prompt Box */}
                                                        {vuln.aiAnalysis.vibePrompt && (
                                                            <div style={{
                                                                background: 'rgba(0,0,0,0.3)',
                                                                padding: '0.75rem',
                                                                borderRadius: '0.4rem',
                                                                marginBottom: '1rem',
                                                                borderLeft: '3px solid #00ff88'
                                                            }}>
                                                                <div style={{ fontSize: '0.625rem', color: '#666', marginBottom: '0.25rem', fontFamily: 'monospace' }}>TARGETED AI FIX PROMPT:</div>
                                                                <div style={{ fontSize: '0.75rem', color: '#00ff88', fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight: '150px', overflow: 'auto' }}>
                                                                    {vuln.aiAnalysis.vibePrompt}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.6, fontFamily: 'monospace' }}>
                                                            <ReactMarkdown
                                                                rehypePlugins={[rehypeSanitize]}
                                                                components={{
                                                                    h1: ({ node, ...props }) => <h1 style={{ color: '#00ccff', fontSize: '1.25rem', fontWeight: '900', marginBottom: '1rem' }} {...props} />,
                                                                    h2: ({ node, ...props }) => <h2 style={{ color: '#00ff88', fontSize: '1.1rem', fontWeight: '800', marginTop: '1.5rem', marginBottom: '0.75rem' }} {...props} />,
                                                                    h3: ({ node, ...props }) => <h3 style={{ color: '#ffaa00', fontSize: '1rem', fontWeight: '700', marginTop: '1rem', marginBottom: '0.5rem' }} {...props} />,
                                                                    p: ({ node, ...props }) => <p style={{ marginBottom: '0.75rem' }} {...props} />,
                                                                    a: ({ node, ...props }) => <a style={{ color: '#00ff88', textDecoration: 'underline' }} {...props} />,
                                                                    code: ({ node, ...props }) => <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem', borderRadius: '4px', color: '#ffaa00' }} {...props} />,
                                                                    pre: ({ node, ...props }) => (
                                                                        <pre style={{
                                                                            background: 'rgba(0,0,0,0.5)',
                                                                            padding: '1rem',
                                                                            borderRadius: '0.5rem',
                                                                            overflow: 'auto',
                                                                            marginBottom: '1rem',
                                                                            border: '1px solid rgba(0,255,136,0.2)'
                                                                        }} {...props} />
                                                                    ),
                                                                    ul: ({ node, ...props }) => <ul style={{ paddingLeft: '1.5rem', marginBottom: '0.75rem' }} {...props} />,
                                                                    li: ({ node, ...props }) => <li style={{ marginBottom: '0.25rem' }} {...props} />,
                                                                    strong: ({ node, ...props }) => <strong style={{ color: '#fff', fontWeight: '700' }} {...props} />
                                                                }}
                                                            >
                                                                {(vuln.aiAnalysis.explanation?.technicalDetails || 'Analysis complete') +
                                                                    (vuln.aiAnalysis.fixSuggestion ? `\n\n### 🚀 SUGGESTED FIX\n${vuln.aiAnalysis.fixSuggestion}` : '')}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{
                                    background: 'rgba(0, 255, 136, 0.1)',
                                    border: '2px solid #00ff88',
                                    borderRadius: '1rem',
                                    padding: '3rem',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#00ff88', fontFamily: 'monospace' }}>
                                        ALL CLEAR
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {!currentResult && !scanning && (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>👁️</div>
                            <div style={{ fontSize: '1rem', fontFamily: 'monospace' }}>SELECT A REPO TO SCAN</div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
