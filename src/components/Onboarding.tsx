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
            // Save onboarding completion
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(20px)',
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}
        >
            {/* Background particles effect */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.05) 0%, transparent 50%)',
                pointerEvents: 'none'
            }} />

            <motion.div
                key={step}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: -20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{
                    background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.98), rgba(0, 20, 30, 0.98))',
                    border: '2px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: '1.5rem',
                    padding: '3rem',
                    maxWidth: '600px',
                    width: '100%',
                    boxShadow: '0 30px 90px rgba(0, 255, 136, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Progress bar */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'rgba(0, 255, 136, 0.1)'
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, #00ff88, #00ccff)',
                            boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
                        }}
                    />
                </div>

                {/* Skip button */}
                {step < steps.length - 1 && (
                    <button
                        onClick={handleSkip}
                        style={{
                            position: 'absolute',
                            top: '1.5rem',
                            right: '1.5rem',
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#999',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontFamily: 'monospace',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.color = '#999';
                        }}
                    >
                        SKIP TOUR
                    </button>
                )}

                {/* Emoji animation */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    style={{
                        fontSize: '5rem',
                        textAlign: 'center',
                        marginBottom: '1.5rem',
                        filter: 'drop-shadow(0 0 20px rgba(0, 255, 136, 0.3))'
                    }}
                >
                    {currentStep.emoji}
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        fontSize: '2rem',
                        fontWeight: '900',
                        background: 'linear-gradient(90deg, #00ff88, #00ccff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textAlign: 'center',
                        marginBottom: '0.5rem',
                        fontFamily: 'monospace',
                        letterSpacing: '0.02em'
                    }}
                >
                    {currentStep.title}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    style={{
                        fontSize: '1rem',
                        color: '#999',
                        textAlign: 'center',
                        marginBottom: '2rem',
                        fontFamily: 'monospace'
                    }}
                >
                    {currentStep.subtitle}
                </motion.p>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{ marginBottom: '2.5rem' }}
                >
                    {currentStep.type === 'input' && (
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder={currentStep.inputPlaceholder}
                            autoFocus
                            style={{
                                width: '100%',
                                background: 'rgba(0, 255, 136, 0.05)',
                                border: '2px solid rgba(0, 255, 136, 0.3)',
                                borderRadius: '0.75rem',
                                padding: '1rem 1.5rem',
                                fontSize: '1.125rem',
                                color: '#fff',
                                fontFamily: 'monospace',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#00ff88';
                                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0, 255, 136, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.3)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && canProceed()) handleNext();
                            }}
                        />
                    )}

                    {currentStep.type === 'selection' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {currentStep.options?.map((option) => (
                                <motion.button
                                    key={option.value}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setUserGoal(option.value)}
                                    style={{
                                        background: userGoal === option.value
                                            ? 'linear-gradient(90deg, rgba(0, 255, 136, 0.2), rgba(0, 204, 255, 0.2))'
                                            : 'rgba(0, 255, 136, 0.05)',
                                        border: userGoal === option.value
                                            ? '2px solid #00ff88'
                                            : '2px solid rgba(0, 255, 136, 0.2)',
                                        borderRadius: '0.75rem',
                                        padding: '1.25rem',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontFamily: 'monospace',
                                        textAlign: 'left',
                                        transition: 'all 0.3s ease',
                                        boxShadow: userGoal === option.value
                                            ? '0 4px 20px rgba(0, 255, 136, 0.2)'
                                            : 'none'
                                    }}
                                >
                                    <div style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                                        {option.label}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#999' }}>
                                        {option.desc}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    )}

                    {(currentStep.type === 'intro' || currentStep.type === 'feature' || currentStep.type === 'completion') && (
                        <p style={{
                            fontSize: '1.0625rem',
                            color: '#cbd5e1',
                            lineHeight: 1.8,
                            textAlign: 'center',
                            fontFamily: 'system-ui'
                        }}>
                            {currentStep.content}
                        </p>
                    )}
                </motion.div>

                {/* Navigation */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {step > 0 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            style={{
                                background: 'transparent',
                                border: '2px solid rgba(255, 255, 255, 0.2)',
                                color: '#fff',
                                padding: '1rem 2rem',
                                borderRadius: '0.75rem',
                                fontSize: '1rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                fontFamily: 'monospace',
                                transition: 'all 0.2s ease',
                                flex: 1
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            }}
                        >
                            ← BACK
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        style={{
                            flex: step > 0 ? 2 : 1,
                            background: canProceed()
                                ? 'linear-gradient(90deg, #00ff88, #00ccff)'
                                : 'rgba(100, 100, 100, 0.3)',
                            border: 'none',
                            color: canProceed() ? '#0a0a0f' : '#666',
                            padding: '1rem 2rem',
                            borderRadius: '0.75rem',
                            fontSize: '1rem',
                            fontWeight: '800',
                            cursor: canProceed() ? 'pointer' : 'not-allowed',
                            fontFamily: 'monospace',
                            boxShadow: canProceed() ? '0 4px 20px rgba(0, 255, 136, 0.3)' : 'none',
                            transition: 'all 0.3s ease',
                            transform: canProceed() ? 'none' : 'scale(0.98)'
                        }}
                        onMouseEnter={(e) => {
                            if (canProceed()) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 25px rgba(0, 255, 136, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (canProceed()) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 255, 136, 0.3)';
                            }
                        }}
                    >
                        {step === steps.length - 1 ? '🚀 START SECURING' : 'NEXT →'}
                    </button>
                </div>

                {/* Step indicator */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '2rem'
                }}>
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            style={{
                                width: index === step ? '2rem' : '0.5rem',
                                height: '0.5rem',
                                borderRadius: '0.25rem',
                                background: index === step
                                    ? 'linear-gradient(90deg, #00ff88, #00ccff)'
                                    : 'rgba(255, 255, 255, 0.2)',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
