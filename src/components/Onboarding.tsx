'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingProps {
    onComplete: () => void;
    onDemoDataChange?: (demoData: any) => void;
}

// Demo scan data for interactive tour
const createDemoData = (userName: string) => ({
    'demo-repo': {
        repoName: 'my-awesome-app',
        owner: userName || 'you',
        scanTimestamp: new Date().toISOString(),
        status: 'needs-attention' as const,
        summary: 'Found 2 security vulnerabilities that need attention',
        vulnerabilities: [
            {
                id: 'demo-xss-1',
                type: 'dangerous-api' as const,
                severity: 'high' as const,
                title: 'Unsafe HTML Rendering Detected',
                description: 'Using dangerouslySetInnerHTML without proper sanitization can lead to XSS attacks',
                file: 'src/components/UserProfile.tsx',
                line: 42,
                snippet: '<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userBio) }} />',
                recommendation: 'Use DOMPurify.sanitize() to clean user input before rendering HTML'
            },
            {
                id: 'demo-injection-1',
                type: 'ssr-injection' as const,
                severity: 'medium' as const,
                title: 'Potential SSR Injection Risk',
                description: 'Direct use of URL parameters in server-side rendering without validation',
                file: 'src/pages/blog/[slug].tsx',
                line: 28,
                snippet: 'const content = await getPost(params.slug);',
                recommendation: 'Validate and sanitize all URL parameters before using in database queries'
            }
        ],
        stackInfo: {
            stack: 'react',
            version: '18.2.0',
            isNextJS: true,
            hasTypeScript: true
        }
    }
});

export default function Onboarding({ onComplete, onDemoDataChange }: OnboardingProps) {
    const [step, setStep] = useState(0);
    const [userName, setUserName] = useState('');
    const [userGoal, setUserGoal] = useState('');
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
        return () => window.removeEventListener('resize', handleResize);
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
            title: "Welcome to Aeglyn! 👋",
            subtitle: "Your AI-powered security companion",
            content: "We're excited to have you here! Let's take a quick tour to help you get the most out of Aeglyn.",
            emoji: "🛡️",
            type: "intro"
        },
        {
            title: "What should we call you?",
            subtitle: "Let's make this personal",
            content: "We'd love to know your name to personalize your experience.",
            emoji: "✨",
            type: "input"
        },
        {
            title: `Nice to meet you, ${userName || 'friend'}! 🎉`,
            subtitle: "What brings you here today?",
            content: "Select your primary goal with Aeglyn:",
            emoji: "🎯",
            type: "selection",
            options: [
                { value: "scan", label: "🔍 Scan my repositories", desc: "Find and fix security vulnerabilities" },
                { value: "learn", label: "📚 Learn about security", desc: "Understand common threats" },
                { value: "fix", label: "🛠️ Auto-fix issues", desc: "Generate security patches" },
                { value: "explore", label: "🌟 Just exploring", desc: "See what Aeglyn can do" }
            ]
        },
        {
            title: "🎨 Your Dashboard",
            subtitle: "Meet your command center",
            content: "This is where you'll see all your repositories. I've loaded a demo to show you around!",
            emoji: "🖥️",
            type: "tour",
            tourStep: "dashboard"
        },
        {
            title: "🔍 Security Scan Results",
            subtitle: "See what we found",
            content: "When you scan a repo, you'll see detailed vulnerability reports like this one. Each issue includes the file, line number, and how to fix it!",
            emoji: "🔬",
            type: "tour",
            tourStep: "scan"
        },
        {
            title: "🚀 One-Click Auto-Fix",
            subtitle: "Let AI fix it for you",
            content: "Click this button and we'll create a pull request with all the fixes automatically. Review and merge when ready!",
            emoji: "⚡",
            type: "tour",
            tourStep: "autofix"
        },
        {
            title: `You're all set, ${userName || 'champ'}! 🎊`,
            subtitle: "Ready to secure your code?",
            content: "Click 'Fetch Repos' in your dashboard to load your actual repositories and start scanning!",
            emoji: "🎉",
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
            localStorage.setItem('vulscany_user_goal', userGoal);
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
        if (currentStep.type === 'selection') return userGoal.length > 0;
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
                bottom: isMobile ? '1rem' : '2rem',
                right: isMobile ? '1rem' : '2rem',
                zIndex: 10001,
                background: 'linear-gradient(145deg, rgba(10, 12, 16, 0.98), rgba(5, 15, 25, 0.98))',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: '1.25rem',
                padding: isMobile ? '1.5rem' : '2rem',
                maxWidth: isMobile ? '320px' : '420px',
                boxShadow: `
                    0 0 0 1px rgba(0, 255, 136, 0.15),
                    0 20px 40px rgba(0, 0, 0, 0.5),
                    0 0 80px rgba(0, 255, 136, 0.2)
                `
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
                    borderBottom: '10px solid rgba(0, 255, 136, 0.3)',
                }} />
            )}

            <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>
                {currentStep.emoji}
            </div>

            <h3 style={{
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem',
                fontFamily: 'ui-monospace, monospace',
                textAlign: 'center'
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
                        background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                        border: 'none',
                        color: '#0a0a0f',
                        padding: '0.875rem 1.5rem',
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: '900',
                        cursor: 'pointer',
                        fontFamily: 'ui-monospace, monospace',
                        boxShadow: '0 4px 20px rgba(0, 255, 136, 0.3)'
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
                            background: i === step ? 'linear-gradient(90deg, #00ff88, #00d4ff)' : 'rgba(255, 255, 255, 0.2)',
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
                initial={{ scale: 0.92, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: -30 }}
                transition={{ type: 'spring', damping: 30, stiffness: 400, mass: 0.8 }}
                style={{
                    background: 'linear-gradient(145deg, rgba(10, 12, 16, 0.95), rgba(5, 15, 25, 0.98))',
                    border: '1px solid rgba(0, 255, 136, 0.25)',
                    borderRadius: '1.75rem',
                    padding: modalPadding,
                    maxWidth: '640px',
                    width: modalWidth,
                    maxHeight: '92vh',
                    overflowY: 'auto',
                    boxShadow: `
                        0 0 0 1px rgba(0, 255, 136, 0.1),
                        0 8px 16px rgba(0, 0, 0, 0.4),
                        0 24px 48px rgba(0, 0, 0, 0.3),
                        0 0 80px rgba(0, 255, 136, 0.15)
                    `,
                    position: 'relative',
                    margin: 'auto'
                }}
            >
                {/* Progress bar */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.15), rgba(0, 204, 255, 0.15))',
                    borderRadius: '1.75rem 1.75rem 0 0',
                    overflow: 'hidden'
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.7, ease: [0.4, 0.0, 0.2, 1] }}
                        style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
                            boxShadow: '0 0 20px rgba(0, 255, 136, 0.6)'
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
                        filter: 'drop-shadow(0 4px 24px rgba(0, 255, 136, 0.25))'
                    }}
                >
                    {currentStep.emoji}
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    style={{
                        fontSize: titleSize,
                        fontWeight: '900',
                        background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textAlign: 'center',
                        marginBottom: '0.75rem',
                        fontFamily: 'ui-monospace, monospace',
                        letterSpacing: '-0.02em',
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
                                background: 'rgba(0, 255, 136, 0.03)',
                                border: '2px solid rgba(0, 255, 136, 0.25)',
                                borderRadius: '0.875rem',
                                padding: '1.125rem 1.5rem',
                                fontSize: '1.125rem',
                                color: '#ffffff',
                                fontFamily: 'ui-monospace, monospace',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#00ff88';
                                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0, 255, 136, 0.12)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.25)';
                                e.currentTarget.style.boxShadow = '0 0 0 0 rgba(0, 255, 136, 0)';
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
                                    onClick={() => setUserGoal(option.value)}
                                    style={{
                                        background: userGoal === option.value
                                            ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 204, 255, 0.15))'
                                            : 'rgba(0, 255, 136, 0.03)',
                                        border: userGoal === option.value
                                            ? '2px solid #00ff88'
                                            : '2px solid rgba(0, 255, 136, 0.2)',
                                        borderRadius: '0.875rem',
                                        padding: '1.25rem 1.5rem',
                                        color: '#ffffff',
                                        cursor: 'pointer',
                                        fontFamily: 'ui-monospace, monospace',
                                        textAlign: 'left',
                                        transition: 'all 0.3s',
                                        boxShadow: userGoal === option.value
                                            ? '0 0 0 1px rgba(0, 255, 136, 0.2), 0 8px 24px rgba(0, 255, 136, 0.15)'
                                            : '0 2px 8px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    <div style={{ fontSize: '1.0625rem', fontWeight: '800', marginBottom: '0.375rem', color: userGoal === option.value ? '#00ff88' : '#ffffff' }}>
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
                            background: canProceed() ? 'linear-gradient(135deg, #00ff88, #00d4ff)' : 'rgba(100, 100, 100, 0.2)',
                            border: 'none',
                            color: canProceed() ? '#0a0a0f' : '#64748b',
                            padding: getResponsiveValue('0.875rem 1.5rem', '1.125rem 2rem', '1.25rem 2.5rem'),
                            borderRadius: '0.875rem',
                            fontSize: getResponsiveValue('0.9375rem', '1rem', '1.0625rem'),
                            fontWeight: '900',
                            cursor: canProceed() ? 'pointer' : 'not-allowed',
                            fontFamily: 'ui-monospace, monospace',
                            boxShadow: canProceed() ? '0 4px 20px rgba(0, 255, 136, 0.3)' : 'none',
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
                            animate={{ width: i === step ? '2.5rem' : '0.625rem' }}
                            transition={{ duration: 0.3 }}
                            style={{
                                height: '0.625rem',
                                borderRadius: '0.3125rem',
                                background: i === step ? 'linear-gradient(90deg, #00ff88, #00d4ff)' : i < step ? 'rgba(0, 255, 136, 0.4)' : 'rgba(255, 255, 255, 0.15)',
                                boxShadow: i === step ? '0 0 12px rgba(0, 255, 136, 0.4)' : 'none',
                                cursor: i < step ? 'pointer' : 'default'
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
                        0 0 0 4px rgba(0, 255, 136, 0.3),
                        0 0 0 99999px rgba(0, 0, 0, 0.85),
                        0 0 40px rgba(0, 255, 136, 0.5)
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
                        border: '2px solid rgba(0, 255, 136, 0.5)'
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
                        ? 'rgba(0, 0, 0, 0.3)' // Lighter for interactive tour
                        : 'radial-gradient(circle at center, rgba(0, 0, 0, 0.92), rgba(0, 0, 0, 0.98))',
                    backdropFilter: isInteractiveTour ? 'blur(4px)' : 'blur(24px)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isInteractiveTour ? '0' : (isMobile ? '1rem' : '2rem'),
                    overflowY: isInteractiveTour ? 'hidden' : 'auto',
                    pointerEvents: isInteractiveTour ? 'none' : 'auto'
                }}
            >
                {/* Animated background effect for modal mode */}
                {!isInteractiveTour && (
                    <motion.div
                        animate={{
                            background: [
                                'radial-gradient(circle at 20% 50%, rgba(0, 255, 136, 0.08) 0%, transparent 50%)',
                                'radial-gradient(circle at 80% 50%, rgba(0, 204, 255, 0.08) 0%, transparent 50%)',
                                'radial-gradient(circle at 50% 80%, rgba(0, 255, 136, 0.08) 0%, transparent 50%)',
                                'radial-gradient(circle at 20% 50%, rgba(0, 255, 136, 0.08) 0%, transparent 50%)'
                            ]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
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
