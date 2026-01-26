'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLenis } from 'lenis/react';
import { Shield, Zap, Search, Box, ChevronRight, CheckCircle2, Cpu, Smartphone, Layout, LogOut, Terminal, History, Activity } from 'lucide-react';

interface OnboardingProps {
    onComplete: () => void;
    onDemoDataChange?: (demoData: any) => void;
}

// Demo scan data for interactive tour
const createDemoData = (userName: string) => ({
    [`${userName || 'developer'}/aeglyn-secure-webapp`]: {
        repoName: 'aeglyn-secure-webapp',
        owner: userName || 'developer',
        scanTimestamp: new Date().toISOString(),
        status: 'needs-attention' as const,
        summary: 'Detected 3 high-risk security threats in your production code',
        vulnerabilities: [
            {
                id: 'demo-secret-1',
                type: 'dangerous-api' as const,
                severity: 'critical' as const,
                title: 'CRITICAL: Hardcoded API Secret Found',
                description: 'A production environment variable was found hardcoded in the source code. This is an immediate security risk.',
                file: 'src/lib/config.ts',
                line: 12,
                snippet: 'const STRIPE_SECRET = "sk_live_51P...";',
                recommendation: 'Move the secret to a secure environment variable and rotate this key immediately.'
            },
            {
                id: 'demo-xss-1',
                type: 'dangerous-api' as const,
                severity: 'high' as const,
                title: 'High: Unsafe Cross-Site Scripting (XSS)',
                description: 'Using dangerouslySetInnerHTML with unsanitized user input in a public profile component.',
                file: 'src/components/ReviewBox.tsx',
                line: 104,
                snippet: '<div dangerouslySetInnerHTML={{ __html: commentText }} />',
                recommendation: 'Apply Aeglyn-recommended DOMPurify sanitization or use standard React text rendering.'
            },
            {
                id: 'demo-injection-1',
                type: 'ssr-injection' as const,
                severity: 'medium' as const,
                title: 'Medium: Potential SQL/SSR Injection',
                description: 'Unvalidated URL parameters used directly in a data fetching utility.',
                file: 'src/app/api/posts/route.ts',
                line: 15,
                snippet: 'const posts = await db.query(`SELECT * FROM posts WHERE id = ${id}`);',
                recommendation: 'Use parameterized queries or ORM validation to prevent injection attacks.'
            }
        ],
        stackInfo: {
            stack: 'nextjs',
            version: '15.1.0',
            isNextJS: true,
            hasTypeScript: true,
            dependencies: { "react": "18.2.0", "next": "14.1.0" },
            devDependencies: { "typescript": "5.3.3" }
        }
    }
});

export default function Onboarding({ onComplete, onDemoDataChange }: OnboardingProps) {
    const [step, setStep] = useState(0);
    const [userName, setUserName] = useState('');
    const [selection, setSelection] = useState<string[]>([]);
    const lenis = useLenis();

    useEffect(() => {
        if (lenis) lenis.stop();
        return () => { if (lenis) lenis.start(); };
    }, [lenis]);

    const [spotlightTarget, setSpotlightTarget] = useState<HTMLElement | null>(null);
    const isInteractiveTour = step >= 4 && step < 7;

    // Inject demo data when entering interactive tour
    useEffect(() => {
        if (step === 4 && onDemoDataChange) {
            onDemoDataChange(createDemoData(userName));
        }
        if (step >= 7 && onDemoDataChange) {
            onDemoDataChange(null); // Clear demo data
        }
    }, [step, userName, onDemoDataChange]);

    // Update spotlight target based on step
    useEffect(() => {
        if (!isInteractiveTour) {
            setSpotlightTarget(null);
            return;
        }

        const getTargetElement = () => {
            switch (step) {
                case 4: // Sidebar Selection
                    return document.querySelector('[data-onboarding="repo-section"]');
                case 5: // Results Panel
                    return document.querySelector('[data-onboarding="results-panel"]');
                case 6: // Auto-fix
                    return document.querySelector('[data-onboarding="auto-fix-area"]');
                default:
                    return null;
            }
        };

        const updateTarget = () => {
            const target = getTargetElement();
            setSpotlightTarget(target as HTMLElement);
        };

        setTimeout(updateTarget, 200);
        const interval = setInterval(updateTarget, 1000);
        return () => clearInterval(interval);
    }, [step, isInteractiveTour]);

    const steps = [
        {
            title: "Welcome to Aeglyn",
            subtitle: "Your AI-Powered Security Command Center",
            content: "Meet the world's most private security scanner. We help you find and fix vulnerabilities across 6+ web stacks without ever moving your code to our servers.",
            icon: <Shield className="w-12 h-12 text-primary" />,
            type: "intro"
        },
        {
            title: "Zero-Knowledge Security",
            subtitle: "Privacy is our primary directive",
            content: "Aeglyn is GDPR-compliant and designed to be trustless. We scan your code strictly on-device, ensuring zero data retention and total secrets protection.",
            icon: <History className="w-12 h-12 text-emerald-500" />,
            type: "intro"
        },
        {
            title: "What is your callsign?",
            subtitle: "Let's personalize your mission console",
            content: "Your security reports and AI recommendations will be tailored to your development profile.",
            icon: <Terminal className="w-12 h-12 text-blue-500" />,
            type: "input"
        },
        {
            title: `Ready for entry, ${userName || 'Commander'}`,
            subtitle: "Choose your primary deployment goal",
            content: "Our AI engines will optimize their heuristic analysis based on your selection:",
            icon: <Zap className="w-12 h-12 text-yellow-500" />,
            type: "selection",
            options: [
                { value: "scan", label: "Audit Codebases", desc: "Perform deep architectural security scans" },
                { value: "fix", label: "Automated Patches", desc: "Generate production-ready security fixes" },
                { value: "compliance", label: "Compliance Radar", desc: "Maintain GDPR and SOC2 standards" }
            ]
        },
        {
            title: "Project Command",
            subtitle: "Multi-Stack Intelligence",
            content: "The Project Sidebar manages your entire infrastructure. I've injected a demo project to showcase our real-time scanning.",
            icon: <Layout className="w-10 h-10 text-primary" />,
            type: "tour",
            tourStep: "dashboard"
        },
        {
            title: "Expert Auditing",
            subtitle: "Beyond Standard Linting",
            content: "We detect hardcoded secrets, injection risks, and malware patterns. This vulnerability card shows exactly where the risk lives.",
            icon: <Search className="w-10 h-10 text-red-500" />,
            type: "tour",
            tourStep: "scan"
        },
        {
            title: "Instant Remediation",
            subtitle: "Automated Security Engineering",
            content: "Bridge the security gap in seconds. Our AI can generate a complete, validated Pull Request for all detected issues.",
            icon: <Cpu className="w-10 h-10 text-emerald-500" />,
            type: "tour",
            tourStep: "autofix"
        },
        {
            title: "All Systems Go",
            subtitle: "Mission Initialization Complete",
            content: "Connect your GitHub account to begin your first private code scan. Your security journey begins now.",
            icon: <CheckCircle2 className="w-12 h-12 text-primary" />,
            type: "completion"
        }
    ];

    const currentStep = steps[step];
    const progress = ((step + 1) / steps.length) * 100;

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            localStorage.setItem('aeglyn_onboarding_complete', 'true');
            localStorage.setItem('aeglyn_user_name', userName);
            localStorage.setItem('aeglyn_user_goal', JSON.stringify(selection));
            onComplete();
        }
    };

    const handleSkip = () => {
        localStorage.setItem('aeglyn_onboarding_complete', 'true');
        if (onDemoDataChange) onDemoDataChange(null);
        onComplete();
    };

    const canProceed = () => {
        if (currentStep.type === 'input') return userName.trim().length > 0;
        if (currentStep.type === 'selection') return selection.length > 0;
        return true;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8"
            >
                {/* Backdrop effect */}
                {!isInteractiveTour ? (
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl overflow-hidden">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full animate-pulse opacity-50" />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                )}

                {/* Spotlight effect for Tour */}
                {isInteractiveTour && spotlightTarget && (
                    <motion.div
                        key="spotlight"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed pointer-events-none z-[10001]"
                        style={{
                            top: spotlightTarget.getBoundingClientRect().top - 20,
                            left: spotlightTarget.getBoundingClientRect().left - 20,
                            width: spotlightTarget.getBoundingClientRect().width + 40,
                            height: spotlightTarget.getBoundingClientRect().height + 40,
                            borderRadius: '1.5rem',
                            boxShadow: '0 0 0 4px #00ff88, 0 0 0 9999px rgba(0, 0, 0, 0.8), 0 0 40px #00ff88',
                            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -inset-2 border-2 border-[#00ff88]/30 rounded-[1.75rem]"
                        />
                    </motion.div>
                )}

                {/* Main Content */}
                <div className="relative z-[10002] w-full flex items-center justify-center">
                    {!isInteractiveTour ? (
                        <motion.div
                            key={`modal-${step}`}
                            {...modalAnimation}
                            className="bg-[#0A0A0B] border border-white/10 rounded-[40px] p-8 md:p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden"
                        >
                            {/* Inner gradient border */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                            {/* Skip button */}
                            <button
                                onClick={handleSkip}
                                className="absolute top-8 right-8 text-[10px] font-black font-mono text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest px-3 py-1.5 border border-white/5 rounded-full"
                            >
                                SKIP TOUR
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="p-6 bg-white/[0.03] border border-white/10 rounded-[32px] mb-8"
                                >
                                    {currentStep.icon}
                                </motion.div>

                                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-4 uppercase italic">
                                    {currentStep.title}
                                </h1>
                                <p className="text-xs font-mono font-bold text-primary uppercase tracking-[0.2em] mb-6">
                                    {currentStep.subtitle}
                                </p>
                                <p className="text-sm md:text-base text-white/50 font-mono leading-relaxed mb-10 max-w-md">
                                    {currentStep.content}
                                </p>

                                <div className="w-full space-y-4">
                                    {currentStep.type === 'input' && (
                                        <input
                                            type="text"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            placeholder="OPERATOR NAME"
                                            className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-white text-center font-mono focus:border-primary/50 outline-none transition-all placeholder:text-white/10"
                                            autoFocus
                                            onKeyPress={(e) => e.key === 'Enter' && canProceed() && handleNext()}
                                        />
                                    )}

                                    {currentStep.type === 'selection' && (
                                        <div className="grid gap-3">
                                            {currentStep.options?.map((opt: any) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => setSelection([opt.value])}
                                                    className={`p-4 border-2 rounded-2xl flex items-center justify-between text-left transition-all ${selection.includes(opt.value)
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                                                        }`}
                                                >
                                                    <div>
                                                        <div className={`text-xs font-black font-mono uppercase ${selection.includes(opt.value) ? 'text-primary' : 'text-white'}`}>
                                                            {opt.label}
                                                        </div>
                                                        <div className="text-[10px] text-white/40 font-mono mt-1">{opt.desc}</div>
                                                    </div>
                                                    {selection.includes(opt.value) && <Zap className="w-4 h-4 text-primary fill-primary" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex w-full gap-4 mt-12">
                                    {step > 0 && (
                                        <button
                                            onClick={() => setStep(step - 1)}
                                            className="flex-1 py-4 border-2 border-white/5 rounded-2xl text-xs font-black font-mono text-white/40 hover:text-white hover:bg-white/5 transition-all"
                                        >
                                            ← PREV
                                        </button>
                                    )}
                                    <button
                                        onClick={handleNext}
                                        disabled={!canProceed()}
                                        className={`flex-[2] py-4 rounded-2xl text-[11px] font-black font-mono tracking-widest transition-all ${canProceed()
                                            ? 'bg-white text-black hover:scale-[1.02] active:scale-[0.98]'
                                            : 'bg-white/5 text-white/20'
                                            }`}
                                    >
                                        {step === steps.length - 1 ? 'LAUNCH CONSOLE →' : 'NEXT STEP →'}
                                    </button>
                                </div>

                                {/* Progress Dots */}
                                <div className="flex gap-2 mt-8">
                                    {steps.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-primary shadow-[0_0_10px_rgba(0,255,136,0.4)]' : 'w-2 bg-white/10'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* Tour Tooltip Mode */
                        <motion.div
                            key={`tour-${step}`}
                            {...tourTransition}
                            className="fixed bottom-12 right-12 max-w-[400px] w-full bg-[#0A0A0B]/90 backdrop-blur-xl border border-[#00ff88]/30 rounded-[32px] p-8 shadow-2xl pointer-events-auto"
                        >
                            <div className="flex items-start gap-6 mb-6">
                                <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
                                    {currentStep.icon}
                                </div>
                                <div className="pt-2">
                                    <h3 className="text-xl font-bold text-white tracking-tight leading-none mb-1 uppercase">
                                        {currentStep.title}
                                    </h3>
                                    <p className="text-[10px] font-bold font-mono text-[#00ff88] uppercase tracking-widest">
                                        {currentStep.subtitle}
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-white/50 font-mono leading-relaxed mb-8">
                                {currentStep.content}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="flex-1 py-3 border border-white/10 rounded-xl text-[10px] font-black font-mono text-white/40 hover:text-white transition-all"
                                >
                                    BACK
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="flex-[2] py-3 bg-[#00ff88] text-black rounded-xl text-[10px] font-black font-mono tracking-widest active:scale-95 transition-all"
                                >
                                    CONTINUE →
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

const modalAnimation = {
    initial: { scale: 0.9, y: 40, opacity: 0 },
    animate: { scale: 1, y: 0, opacity: 1 },
    exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } },
    transition: { type: 'spring', damping: 25, stiffness: 200 } as const
};

const tourTransition = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
    transition: { type: 'spring', damping: 30, stiffness: 250 } as const
};
