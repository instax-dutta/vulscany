'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingProps {
    onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(0);
    const [userName, setUserName] = useState('');
    const [userGoal, setUserGoal] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    // Proper responsive handling with React hooks
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 480);
            setIsTablet(window.innerWidth > 480 && window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const steps = [
        {
            title: "Welcome to VullScanny! 👋",
            subtitle: "Your AI-powered security companion",
            content: "We're excited to have you here! Let's take a quick tour to help you get the most out of VullScanny.",
            emoji: "🚀",
            type: "intro"
        },
        {
            title: "What should we call you?",
            subtitle: "Let's make this personal",
            content: "We'd love to know your name to personalize your experience.",
            emoji: "✨",
            type: "input",
            inputPlaceholder: "Enter your name...",
            inputValue: userName,
            onInputChange: setUserName
        },
        {
            title: `Nice to meet you, ${userName || 'friend'}! 🎉`,
            subtitle: "What brings you here today?",
            content: "Select your primary goal with VullScanny:",
            emoji: "🎯",
            type: "selection",
            options: [
                { value: "scan", label: "🔍 Scan my repositories", desc: "Find and fix security vulnerabilities" },
                { value: "learn", label: "📚 Learn about security", desc: "Understand common threats" },
                { value: "fix", label: "🛠️ Auto-fix issues", desc: "Generate security patches" },
                { value: "explore", label: "🌟 Just exploring", desc: "See what VullScanny can do" }
            ],
            selectedValue: userGoal,
            onSelect: setUserGoal
        },
        {
            title: "🎨 Beautiful Dashboard",
            subtitle: "This is your command center",
            content: "From here, you can select repositories, run scans, and view detailed security reports. Think of it as your security mission control!",
            emoji: "🖥️",
            type: "feature",
            highlight: "dashboard"
        },
        {
            title: "🔍 Smart Scanning",
            subtitle: "AI-powered vulnerability detection",
            content: "Our scanner uses advanced AI to detect XSS, dangerous APIs, SSR injection, and more. Each vulnerability comes with detailed explanations and fix suggestions.",
            emoji: "🤖",
            type: "feature",
            highlight: "scanner"
        },
        {
            title: "🚀 Auto-Fix Magic",
            subtitle: "One-click security patches",
            content: "Found a vulnerability? Click the Auto-Fix button and we'll create a pull request with the fix automatically. Review and merge when ready!",
            emoji: "⚡",
            type: "feature",
            highlight: "autofix"
        },
        {
            title: `You're all set, ${userName || 'champ'}! 🎊`,
            subtitle: "Ready to secure your code?",
            content: userGoal === 'scan'
                ? "Let's start by scanning your first repository!"
                : userGoal === 'learn'
                    ? "Explore your dashboard and discover security insights!"
                    : userGoal === 'fix'
                        ? "Scan a repo and watch the auto-fix magic happen!"
                        : "Have fun exploring VullScanny!",
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
            localStorage.setItem('vullscanny_onboarding_complete', 'true');
            localStorage.setItem('vullscanny_user_name', userName);
            localStorage.setItem('vullscanny_user_goal', userGoal);
            onComplete();
        }
    };

    const handleSkip = () => {
        localStorage.setItem('vullscanny_onboarding_complete', 'true');
        onComplete();
    };

    const canProceed = () => {
        if (currentStep.type === 'input') return userName.trim().length > 0;
        if (currentStep.type === 'selection') return userGoal.length > 0;
        return true;
    };

    // Responsive values
    const getResponsiveValue = (mobile: any, tablet: any, desktop: any) => {
        if (isMobile) return mobile;
        if (isTablet) return tablet;
        return desktop;
    };

    const modalPadding = getResponsiveValue('2rem 1.5rem', '2.5rem 2rem', '3rem');
    const modalWidth = getResponsiveValue('calc(100% - 2rem)', 'calc(100% - 4rem)', '100%');
    const emojiSize = getResponsiveValue('3.5rem', '4.5rem', '5.5rem');
    const titleSize = getResponsiveValue('1.5rem', '1.75rem', '2.25rem');
    const subtitleSize = getResponsiveValue('0.9375rem', '1rem', '1.0625rem');
    const buttonPadding = getResponsiveValue('1rem 1.75rem', '1.125rem 2rem', '1.25rem 2.5rem');
    const buttonFontSize = getResponsiveValue('0.9375rem', '1rem', '1.0625rem');

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.92), rgba(0, 0, 0, 0.98))',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isMobile ? '1rem' : '2rem',
                    overflowY: 'auto'
                }}
            >
                {/* Animated background effect */}
                <motion.div
                    animate={{
                        background: [
                            'radial-gradient(circle at 20% 50%, rgba(0, 255, 136, 0.08) 0%, transparent 50%)',
                            'radial-gradient(circle at 80% 50%, rgba(0, 204, 255, 0.08) 0%, transparent 50%)',
                            'radial-gradient(circle at 50% 80%, rgba(0, 255, 136, 0.08) 0%, transparent 50%)',
                            'radial-gradient(circle at 20% 50%, rgba(0, 255, 136, 0.08) 0%, transparent 50%)'
                        ]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none'
                    }}
                />

                <motion.div
                    key={step}
                    initial={{ scale: 0.92, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.92, opacity: 0, y: -30 }}
                    transition={{
                        type: 'spring',
                        damping: 30,
                        stiffness: 400,
                        mass: 0.8
                    }}
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
                    {/* Smooth progress bar */}
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
                                background: 'linear-gradient(90deg, #00ff88, #00ccff)',
                                boxShadow: '0 0 20px rgba(0, 255, 136, 0.6)',
                                position: 'relative'
                            }}
                        >
                            <motion.div
                                animate={{
                                    x: ['-100%', '100%']
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'linear'
                                }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)'
                                }}
                            />
                        </motion.div>
                    </div>

                    {/* Skip button - premium design */}
                    {step < steps.length - 1 && (
                        <motion.button
                            whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 255, 0.5)' }}
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
                                transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                letterSpacing: '0.025em'
                            }}
                        >
                            SKIP TOUR
                        </motion.button>
                    )}

                    {/* Animated emoji */}
                    <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: 'spring',
                            delay: 0.15,
                            damping: 15,
                            stiffness: 300
                        }}
                        style={{
                            fontSize: emojiSize,
                            textAlign: 'center',
                            marginTop: '1rem',
                            marginBottom: isMobile ? '1.25rem' : '1.75rem',
                            filter: 'drop-shadow(0 4px 24px rgba(0, 255, 136, 0.25))',
                            lineHeight: 1
                        }}
                    >
                        {currentStep.emoji}
                    </motion.div>

                    {/* Title with gradient */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.5 }}
                        style={{
                            fontSize: titleSize,
                            fontWeight: '900',
                            background: 'linear-gradient(135deg, #00ff88 0%, #00ccff 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
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
                        transition={{ delay: 0.35, duration: 0.5 }}
                        style={{
                            fontSize: subtitleSize,
                            color: '#94a3b8',
                            textAlign: 'center',
                            marginBottom: isMobile ? '1.75rem' : '2.25rem',
                            fontFamily: 'ui-monospace, monospace',
                            fontWeight: '500',
                            letterSpacing: '0.01em'
                        }}
                    >
                        {currentStep.subtitle}
                    </motion.p>

                    {/* Content area */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.5 }}
                        style={{ marginBottom: isMobile ? '2rem' : '2.5rem' }}
                    >
                        {/* Input field */}
                        {currentStep.type === 'input' && (
                            <motion.input
                                initial={{ scale: 0.98 }}
                                animate={{ scale: 1 }}
                                whileFocus={{ scale: 1.01 }}
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder={currentStep.inputPlaceholder}
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
                                    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    boxShadow: '0 0 0 0 rgba(0, 255, 136, 0)'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#00ff88';
                                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0, 255, 136, 0.12)';
                                    e.currentTarget.style.background = 'rgba(0, 255, 136, 0.05)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.25)';
                                    e.currentTarget.style.boxShadow = '0 0 0 0 rgba(0, 255, 136, 0)';
                                    e.currentTarget.style.background = 'rgba(0, 255, 136, 0.03)';
                                }}
                            />
                        )}

                        {/* Selection cards */}
                        {currentStep.type === 'selection' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                {currentStep.options?.map((option, index) => (
                                    <motion.button
                                        key={option.value}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02, x: 4 }}
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
                                            transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                            boxShadow: userGoal === option.value
                                                ? '0 0 0 1px rgba(0, 255, 136, 0.2), 0 8px 24px rgba(0, 255, 136, 0.15)'
                                                : '0 2px 8px rgba(0, 0, 0, 0.1)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {userGoal === option.value && (
                                            <motion.div
                                                layoutId="selectedBg"
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.08), rgba(0, 204, 255, 0.08))',
                                                    zIndex: 0
                                                }}
                                                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                                            />
                                        )}
                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                            <div style={{
                                                fontSize: '1.0625rem',
                                                fontWeight: '800',
                                                marginBottom: '0.375rem',
                                                color: userGoal === option.value ? '#00ff88' : '#ffffff'
                                            }}>
                                                {option.label}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: '500' }}>
                                                {option.desc}
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {/* Feature content */}
                        {(currentStep.type === 'intro' || currentStep.type === 'feature' || currentStep.type === 'completion') && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                style={{
                                    fontSize: '1.0625rem',
                                    color: '#cbd5e1',
                                    lineHeight: 1.7,
                                    textAlign: 'center',
                                    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                                    fontWeight: '400',
                                    maxWidth: '520px',
                                    margin: '0 auto'
                                }}
                            >
                                {currentStep.content}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Navigation buttons */}
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column-reverse' : 'row',
                        gap: '0.875rem',
                        alignItems: 'stretch'
                    }}>
                        {step > 0 && (
                            <motion.button
                                whileHover={{ scale: 1.02, x: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setStep(step - 1)}
                                style={{
                                    flex: isMobile ? 'none' : 1,
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    backdropFilter: 'blur(10px)',
                                    border: '2px solid rgba(255, 255, 255, 0.15)',
                                    color: '#ffffff',
                                    padding: buttonPadding,
                                    borderRadius: '0.875rem',
                                    fontSize: buttonFontSize,
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    fontFamily: 'ui-monospace, monospace',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    letterSpacing: '0.025em'
                                }}
                            >
                                ← BACK
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={canProceed() ? { scale: 1.02, y: -2 } : {}}
                            whileTap={canProceed() ? { scale: 0.98 } : {}}
                            onClick={handleNext}
                            disabled={!canProceed()}
                            style={{
                                flex: isMobile ? 'none' : (step > 0 ? 2 : 1),
                                background: canProceed()
                                    ? 'linear-gradient(135deg, #00ff88 0%, #00ccff 100%)'
                                    : 'rgba(100, 100, 100, 0.2)',
                                border: 'none',
                                color: canProceed() ? '#0a0a0f' : '#64748b',
                                padding: buttonPadding,
                                borderRadius: '0.875rem',
                                fontSize: buttonFontSize,
                                fontWeight: '900',
                                cursor: canProceed() ? 'pointer' : 'not-allowed',
                                fontFamily: 'ui-monospace, monospace',
                                boxShadow: canProceed()
                                    ? '0 0 0 1px rgba(0, 255, 136, 0.3), 0 8px 24px rgba(0, 255, 136, 0.25)'
                                    : 'none',
                                transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                opacity: canProceed() ? 1 : 0.5,
                                letterSpacing: '0.025em',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {canProceed() && (
                                <motion.div
                                    animate={{
                                        x: ['-200%', '200%']
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'linear'
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                                        pointerEvents: 'none'
                                    }}
                                />
                            )}
                            <span style={{ position: 'relative', zIndex: 1 }}>
                                {step === steps.length - 1 ? '🚀 START SECURING' : 'NEXT →'}
                            </span>
                        </motion.button>
                    </div>

                    {/* Step indicators */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.625rem',
                        marginTop: isMobile ? '1.75rem' : '2.25rem'
                    }}>
                        {steps.map((_, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    width: index === step ? '2.5rem' : '0.625rem'
                                }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                style={{
                                    height: '0.625rem',
                                    borderRadius: '0.3125rem',
                                    background: index === step
                                        ? 'linear-gradient(90deg, #00ff88, #00ccff)'
                                        : index < step
                                            ? 'rgba(0, 255, 136, 0.4)'
                                            : 'rgba(255, 255, 255, 0.15)',
                                    boxShadow: index === step ? '0 0 12px rgba(0, 255, 136, 0.4)' : 'none',
                                    cursor: index < step ? 'pointer' : 'default'
                                }}
                                onClick={() => index < step && setStep(index)}
                            />
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
