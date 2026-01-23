'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLenis } from 'lenis/react';

interface OnboardingProps {
    onComplete: () => void;
    onDemoDataChange?: (demoData: any) => void;
}

// Demo scan data for interactive tour
const createDemoData = (userName: string) => ({
    'demo-repo': {
        repoName: 'vulscany-secure-webapp',
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
                snippet: 'const STRIPE_SECRET = "process.env.STRIPE_SECRET_KEY";',
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
            hasTypeScript: true
        }
    }
});

export default function Onboarding({ onComplete, onDemoDataChange }: OnboardingProps) {
    const [step, setStep] = useState(0);
    const [userName, setUserName] = useState('');
    const [selection, setSelection] = useState<string[]>([]);
    const lenis = useLenis();

    useEffect(() => {
        if (lenis) {
            lenis.stop();
        }
        return () => {
            if (lenis) {
                lenis.start();
            }
        };
    }, [lenis]);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [spotlightTarget, setSpotlightTarget] = useState<HTMLElement | null>(null);

    const isInteractiveTour = step >= 3 && step < 6;

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 480);
            setIsTablet(window.innerWidth > 480 && window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Inject demo data when entering interactive tour
    useEffect(() => {
        if (step === 3 && onDemoDataChange) {
            onDemoDataChange(createDemoData(userName));
        }
        if (step >= 6 && onDemoDataChange) {
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
                case 3: // Dashboard overview
                    return document.querySelector('[data-onboarding="repo-section"]');
                case 4: // Scan results
                    return document.querySelector('[data-onboarding="scan-results"]');
                case 5: // Auto-fix button
                    return document.querySelector('[data-onboarding="auto-fix"]');
                default:
                    return null;
            }
        };

        const updateTarget = () => {
            const target = getTargetElement();
            setSpotlightTarget(target as HTMLElement);
        };

        // Wait for DOM to render
        setTimeout(updateTarget, 100);

        const interval = setInterval(updateTarget, 500); // Keep checking
        return () => clearInterval(interval);
    }, [step, isInteractiveTour]);

    const steps = [
        {
            title: "Welcome to Aeglyn 👋",
            subtitle: "Your AI-Powered Security Command Center",
            content: "Meet the world's most private security scanner. We help you find and fix vulnerabilities across 6+ web stacks without ever moving your code to our servers.",
            emoji: "🛡️",
            type: "intro"
        },
        {
            title: "Zero-Knowledge Security",
            subtitle: "Privacy is our primary directive",
            content: "Aeglyn is GDPR-compliant and designed to be trustless. We scan your code strictly on-device, ensuring zero data retention and total secrets protection.",
            emoji: "🛡️",
            type: "intro"
        },
        {
            title: "What should we call you?",
            subtitle: "Let's personalize your dashboard",
            content: "We'd love to know your name to make your security reports and AI suggestions feel right at home.",
            emoji: "✨",
            type: "input"
        },
        {
            title: `Nice to meet you, ${userName || 'friend'}! 🎉`,
            subtitle: "How can we help you today?",
            content: "Select your primary goal to help us tune our AI engines for your specific workflow:",
            emoji: "🎯",
            type: "selection",
            options: [
                { value: "scan", label: "🔍 Audit My Repositories", desc: "Perform deep security scans for vulnerabilities" },
                { value: "fix", label: "🛠️ Automated PR Fixes", desc: "Let AI generate security patches for my code" },
                { value: "compliance", label: "⚖️ Privacy & Compliance", desc: "Ensure GDPR and SOC2 readiness" },
                { value: "explore", label: "🌟 Developer Experience", desc: "Enable continuous scanning in my CI/CD" }
            ]
        },
        {
            title: "🎨 Unified Dashboard",
            subtitle: "Multi-Stack Command Center",
            content: "Aeglyn supports Next.js, React, Vue, Angular, and more. I've prepared a demo project to show you how we manage multiple frameworks!",
            emoji: "🖥️",
            type: "tour",
            tourStep: "dashboard"
        },
        {
            title: "🧠 Zero-Day Intelligence",
            subtitle: "Detect what others miss",
            content: "Aeglyn detects hardcoded secrets, injection risks, and obfuscated malware patterns that standard linters miss. Explore this demo report!",
            emoji: "🆔",
            type: "tour",
            tourStep: "scan"
        },
        {
            title: "⚡ Intelligent Auto-Fix",
            subtitle: "Bridge the security gap in seconds",
            content: "Found a critical issue? Our AI creates a production-ready Pull Request to fix it. Total control, zero friction.",
            emoji: "🚀",
            type: "tour",
            tourStep: "autofix"
        },
        {
            title: `Mission Ready, ${userName || 'Commander'}! 🎊`,
            subtitle: "Time to secure your infrastructure",
            content: "Connect your GitHub account to begin your first real-time private code scan. Your security journey starts now.",
            emoji: "✅",
            type: "completion"
        }
    ];

    const currentStep = steps[step];
    const progress = ((step + 1) / steps.length) * 100;

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            localStorage.setItem('vulscany_onboarding_complete', 'true');
            localStorage.setItem('vulscany_user_name', userName);
            localStorage.setItem('vulscany_user_goal', JSON.stringify(selection));
            onComplete();
        }
    };

    const handleSkip = () => {
        localStorage.setItem('vulscany_onboarding_complete', 'true');
        if (onDemoDataChange) onDemoDataChange(null);
        onComplete();
    };

    const canProceed = () => {
        if (currentStep.type === 'input') return userName.trim().length > 0;
        if (currentStep.type === 'selection') return selection.length > 0;
        return true;
    };

    const getResponsiveValue = (mobile: any, tablet: any, desktop: any) => {
        if (isMobile) return mobile;
        if (isTablet) return tablet;
        return desktop;
    };

    // Render interactive tour tooltip (corner position)
    const renderTourTooltip = () => (
        <motion.div
            key={`tour-${step}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
                position: 'fixed',
                bottom: isMobile ? '1.5rem' : '2.5rem',
                right: isMobile ? '1.5rem' : '2.5rem',
                zIndex: 10001,
                background: 'rgba(10, 10, 15, 0.85)',
                backdropFilter: 'blur(32px)',
                border: '1px solid var(--border)',
                borderRadius: '1.5rem',
                padding: isMobile ? '1.5rem' : '2rem',
                maxWidth: isMobile ? '340px' : '440px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 255, 255, 0.1)'
            }}
        >
            {/* Arrow pointer towards highlighted area - only show if we have a target */}
            {spotlightTarget && (
                <div style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderBottom: '10px solid rgba(255, 255, 255, 0.3)',
                }} />
            )}

            <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>
                {currentStep.emoji}
            </div>

            <h3 className="gradient-text" style={{
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                fontWeight: '900',
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-mono)',
                textAlign: 'center',
                letterSpacing: '-0.02em'
            }}>
                {currentStep.title}
            </h3>

            <p style={{
                fontSize: '0.875rem',
                color: '#94a3b8',
                marginBottom: '1.25rem',
                textAlign: 'center',
                fontFamily: 'ui-monospace, monospace'
            }}>
                {currentStep.subtitle}
            </p>

            <p style={{
                fontSize: '1rem',
                color: '#cbd5e1',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
                fontFamily: 'ui-sans-serif, system-ui, sans-serif'
            }}>
                {currentStep.content}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexDirection: isMobile ? 'column' : 'row' }}>
                {step > 0 && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setStep(step - 1)}
                        style={{
                            flex: isMobile ? 'none' : 1,
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '2px solid rgba(255, 255, 255, 0.15)',
                            color: '#ffffff',
                            padding: '0.875rem 1.5rem',
                            borderRadius: '0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            fontFamily: 'ui-monospace, monospace',
                            transition: 'all 0.2s'
                        }}
                    >
                        ← BACK
                    </motion.button>
                )}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    style={{
                        flex: isMobile ? 'none' : (step > 0 ? 2 : 1),
                        background: '#ffffff',
                        border: 'none',
                        color: '#000000',
                        padding: '0.875rem 1.5rem',
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: '900',
                        cursor: 'pointer',
                        fontFamily: 'ui-monospace, monospace',
                        boxShadow: '0 4px 20px rgba(255, 255, 255, 0.2)'
                    }}
                >
                    {step === steps.length - 1 ? '🚀 GET STARTED' : 'NEXT →'}
                </motion.button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
                {steps.map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: i === step ? '2rem' : '0.5rem',
                            height: '0.5rem',
                            borderRadius: '0.25rem',
                            background: i === step ? 'linear-gradient(90deg, var(--primary), var(--primary))' : 'rgba(255, 255, 255, 0.2)',
                            transition: 'all 0.3s'
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );

    // Render full modal for steps 0-2
    const renderModal = () => {
        const modalPadding = getResponsiveValue('2rem 1.5rem', '2.5rem 2rem', '3rem');
        const modalWidth = getResponsiveValue('calc(100% - 2rem)', 'calc(100% - 4rem)', '100%');
        const emojiSize = getResponsiveValue('3.5rem', '4.5rem', '5.5rem');
        const titleSize = getResponsiveValue('1.5rem', '1.75rem', '2.25rem');

        return (
            <motion.div
                key={`modal-${step}`}
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{
                    background: 'rgba(10, 10, 15, 0.9)',
                    border: '1px solid var(--border)',
                    borderRadius: '2rem',
                    padding: modalPadding,
                    maxWidth: '680px',
                    width: modalWidth,
                    maxHeight: '92vh',
                    overflowY: 'auto',
                    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.05), 0 30px 60px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    margin: 'auto',
                    backdropFilter: 'blur(40px)'
                }}
            >
                {/* Progress bar */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.15), rgba(0, 204, 255, 0.15))',
                    borderRadius: '1.75rem 1.75rem 0 0',
                    overflow: 'hidden'
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.7, ease: [0.4, 0.0, 0.2, 1] }}
                        style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--primary), var(--primary))',
                            boxShadow: '0 0 20px rgba(255, 255, 255, 0.6)'
                        }}
                    />
                </div>

                {/* Skip button */}
                {step < steps.length - 1 && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSkip}
                        style={{
                            position: 'absolute',
                            top: isMobile ? '1rem' : '1.5rem',
                            right: isMobile ? '1rem' : '1.75rem',
                            background: 'rgba(0, 0, 0, 0.4)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#94a3b8',
                            padding: '0.625rem 1.25rem',
                            borderRadius: '0.625rem',
                            fontSize: '0.8125rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontFamily: 'ui-monospace, monospace',
                            transition: 'all 0.3s'
                        }}
                    >
                        SKIP TOUR
                    </motion.button>
                )}

                {/* Emoji */}
                <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', delay: 0.15 }}
                    style={{
                        fontSize: emojiSize,
                        textAlign: 'center',
                        marginTop: '1rem',
                        marginBottom: isMobile ? '1.25rem' : '1.75rem',
                        filter: 'drop-shadow(0 4px 24px rgba(255, 255, 255, 0.25))'
                    }}
                >
                    {currentStep.emoji}
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="gradient-text"
                    style={{
                        fontSize: titleSize,
                        fontWeight: '900',
                        textAlign: 'center',
                        marginBottom: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '-0.04em',
                        lineHeight: 1.15
                    }}
                >
                    {currentStep.title}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    style={{
                        fontSize: getResponsiveValue('0.9375rem', '1rem', '1.0625rem'),
                        color: '#94a3b8',
                        textAlign: 'center',
                        marginBottom: isMobile ? '1.75rem' : '2.25rem',
                        fontFamily: 'ui-monospace, monospace'
                    }}
                >
                    {currentStep.subtitle}
                </motion.p>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    style={{ marginBottom: isMobile ? '2rem' : '2.5rem' }}
                >
                    {/* Input */}
                    {currentStep.type === 'input' && (
                        <motion.input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Enter your name..."
                            autoFocus
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && canProceed()) handleNext();
                            }}
                            style={{
                                width: '100%',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '2px solid rgba(255, 255, 255, 0.25)',
                                borderRadius: '0.875rem',
                                padding: '1.125rem 1.5rem',
                                fontSize: '1.125rem',
                                color: '#ffffff',
                                fontFamily: 'ui-monospace, monospace',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--primary)';
                                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(255, 255, 255, 0.12)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                                e.currentTarget.style.boxShadow = '0 0 0 0 rgba(255, 255, 255, 0)';
                            }}
                        />
                    )}

                    {/* Selection */}
                    {currentStep.type === 'selection' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                            {currentStep.options?.map((option: any, index: number) => (
                                <motion.button
                                    key={option.value}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelection([option.value])}
                                    style={{
                                        background: selection.includes(option.value)
                                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(0, 204, 255, 0.15))'
                                            : 'rgba(255, 255, 255, 0.03)',
                                        border: selection.includes(option.value)
                                            ? '2px solid var(--primary)'
                                            : '2px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '0.875rem',
                                        padding: '1.25rem 1.5rem',
                                        color: '#ffffff',
                                        cursor: 'pointer',
                                        fontFamily: 'ui-monospace, monospace',
                                        textAlign: 'left',
                                        transition: 'all 0.3s',
                                        boxShadow: selection.includes(option.value)
                                            ? '0 0 0 1px rgba(255, 255, 255, 0.2), 0 8px 24px rgba(255, 255, 255, 0.15)'
                                            : '0 2px 8px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    <div style={{ fontSize: '1.0625rem', fontWeight: '800', marginBottom: '0.375rem', color: selection.includes(option.value) ? 'var(--primary)' : '#ffffff' }}>
                                        {option.label}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                        {option.desc}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    )}

                    {/* Regular content */}
                    {(currentStep.type === 'intro' || currentStep.type === 'completion') && (
                        <p style={{
                            fontSize: '1.0625rem',
                            color: '#cbd5e1',
                            lineHeight: 1.7,
                            textAlign: 'center',
                            fontFamily: 'ui-sans-serif, system-ui, sans-serif'
                        }}>
                            {currentStep.content}
                        </p>
                    )}
                </motion.div>

                {/* Navigation */}
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', gap: '0.875rem' }}>
                    {step > 0 && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setStep(step - 1)}
                            style={{
                                flex: isMobile ? 'none' : 1,
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '2px solid rgba(255, 255, 255, 0.15)',
                                color: '#ffffff',
                                padding: getResponsiveValue('0.875rem 1.5rem', '1.125rem 2rem', '1.25rem 2.5rem'),
                                borderRadius: '0.875rem',
                                fontSize: getResponsiveValue('0.9375rem', '1rem', '1.0625rem'),
                                fontWeight: '800',
                                cursor: 'pointer',
                                fontFamily: 'ui-monospace, monospace',
                                transition: 'all 0.3s'
                            }}
                        >
                            ← BACK
                        </motion.button>
                    )}
                    <motion.button
                        whileHover={canProceed() ? { scale: 1.02 } : {}}
                        whileTap={canProceed() ? { scale: 0.98 } : {}}
                        onClick={handleNext}
                        disabled={!canProceed()}
                        style={{
                            flex: isMobile ? 'none' : (step > 0 ? 2 : 1),
                            background: canProceed() ? 'linear-gradient(135deg, var(--color-low), var(--primary))' : 'rgba(100, 100, 100, 0.2)',
                            border: 'none',
                            color: canProceed() ? '#0a0a0f' : '#64748b',
                            padding: getResponsiveValue('0.875rem 1.5rem', '1.125rem 2rem', '1.25rem 2.5rem'),
                            borderRadius: '0.875rem',
                            fontSize: getResponsiveValue('0.9375rem', '1rem', '1.0625rem'),
                            fontWeight: '900',
                            cursor: canProceed() ? 'pointer' : 'not-allowed',
                            fontFamily: 'ui-monospace, monospace',
                            boxShadow: canProceed() ? '0 4px 20px rgba(255, 255, 255, 0.3)' : 'none',
                            opacity: canProceed() ? 1 : 0.5,
                            transition: 'all 0.3s'
                        }}
                    >
                        {step === steps.length - 1 ? '🚀 START SECURING' : 'NEXT →'}
                    </motion.button>
                </div>

                {/* Step indicators */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.625rem', marginTop: isMobile ? '1.75rem' : '2.25rem' }}>
                    {steps.map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{ width: i === step ? '3.5rem' : '0.75rem' }}
                            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                            style={{
                                height: '0.5rem',
                                borderRadius: '1rem',
                                background: i === step ? 'var(--primary)' : i < step ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                                cursor: i < step ? 'pointer' : 'default',
                                boxShadow: i === step ? '0 0 15px rgba(255, 255, 255, 0.3)' : 'none'
                            }}
                            onClick={() => i < step && setStep(i)}
                        />
                    ))}
                </div>
            </motion.div>
        );
    };

    // Render spotlight effect during tour
    const renderSpotlight = () => {
        if (!spotlightTarget) return null;

        const rect = spotlightTarget.getBoundingClientRect();
        const padding = 20; // Extra space around element

        return (
            <motion.div
                key="spotlight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    position: 'fixed',
                    top: rect.top - padding,
                    left: rect.left - padding,
                    width: rect.width + padding * 2,
                    height: rect.height + padding * 2,
                    borderRadius: '1rem',
                    boxShadow: `
                        0 0 0 4px var(--primary),
                        0 0 0 99999px rgba(0, 0, 0, 0.85),
                        0 0 40px var(--primary)
                    `,
                    pointerEvents: 'none',
                    zIndex: 10000,
                    transition: 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)'
                }}
            >
                <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                        position: 'absolute',
                        inset: -4,
                        borderRadius: '1rem',
                        border: '2px solid var(--primary)'
                    }}
                />
            </motion.div>
        );
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: isInteractiveTour
                        ? 'rgba(0, 0, 0, 0.4)'
                        : 'radial-gradient(circle at center, rgba(5, 5, 10, 0.94), rgba(0, 0, 0, 0.99))',
                    backdropFilter: isInteractiveTour ? 'blur(2px)' : 'blur(32px)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isInteractiveTour ? '0' : (isMobile ? '1rem' : '1.5rem'),
                    overflow: 'hidden', // Let children handle their own scrolling
                    pointerEvents: isInteractiveTour ? 'none' : 'auto'
                }}
            >
                {/* Animated background effect for modal mode */}
                {!isInteractiveTour && (
                    <motion.div
                        animate={{
                            background: [
                                'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)',
                                'radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
                                'radial-gradient(circle at 50% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)',
                                'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)'
                            ]
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            pointerEvents: 'none'
                        }}
                    />
                )}

                {/* Spotlight effect */}
                {isInteractiveTour && renderSpotlight()}

                {/* Main content */}
                <div style={{ pointerEvents: 'auto', zIndex: 10001 }}>
                    {isInteractiveTour ? renderTourTooltip() : renderModal()}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
