/**
 * Toast Notification System with Gamification
 * Shows contextual, celebratory feedback for user actions
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'info' | 'warning' | 'achievement';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    icon?: string;
}

interface ToastNotificationProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
}

const toastStyles: Record<ToastType, { bg: string; border: string; color: string }> = {
    success: {
        bg: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 204, 255, 0.15))',
        border: '#00ff88',
        color: '#00ff88'
    },
    achievement: {
        bg: 'linear-gradient(135deg, rgba(255, 170, 0, 0.15), rgba(255, 80, 0, 0.15))',
        border: '#ffaa00',
        color: '#ffaa00'
    },
    info: {
        bg: 'linear-gradient(135deg, rgba(0, 204, 255, 0.15), rgba(59, 130, 246, 0.15))',
        border: '#00ccff',
        color: '#00ccff'
    },
    warning: {
        bg: 'linear-gradient(135deg, rgba(255, 0, 85, 0.15), rgba(255, 80, 0, 0.15))',
        border: '#ff0055',
        color: '#ff0055'
    }
};

export function ToastNotifications({ toasts, onDismiss }: ToastNotificationProps) {
    return (
        <div style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxWidth: '420px',
            pointerEvents: 'none'
        }}>
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
                ))}
            </AnimatePresence>
        </div>
    );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const style = toastStyles[toast.type];

    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, toast.duration || 4000);

        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onDismiss]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 400, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
                background: style.bg,
                backdropFilter: 'blur(20px)',
                border: `2px solid ${style.border}`,
                borderRadius: '1rem',
                padding: '1rem 1.25rem',
                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px ${style.border}40`,
                pointerEvents: 'auto',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
            }}
            onClick={() => onDismiss(toast.id)}
        >
            {/* Animated background shimmer */}
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '50%',
                    height: '100%',
                    background: `linear-gradient(90deg, transparent, ${style.border}20, transparent)`,
                    pointerEvents: 'none'
                }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
                        style={{ fontSize: '1.5rem' }}
                    >
                        {toast.icon || (toast.type === 'success' ? '✓' : toast.type === 'achievement' ? '🏆' : 'ℹ️')}
                    </motion.div>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '900',
                            color: style.color,
                            fontFamily: 'var(--font-mono)',
                            marginBottom: '0.25rem',
                            letterSpacing: '0.02em'
                        }}>
                            {toast.title}
                        </div>
                        {toast.message && (
                            <div style={{
                                fontSize: '0.75rem',
                                color: '#cbd5e1',
                                fontFamily: 'var(--font-mono)',
                                lineHeight: 1.4
                            }}>
                                {toast.message}
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress bar */}
                <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: (toast.duration || 4000) / 1000, ease: 'linear' }}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: '3px',
                        background: style.border,
                        borderRadius: '0 0 1rem 1rem'
                    }}
                />
            </div>
        </motion.div>
    );
}

// Hook for managing toasts
export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { ...toast, id }]);
    };

    const dismissToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Gamified toast helpers
    const showSuccess = (title: string, message?: string) => {
        showToast({ type: 'success', title, message, icon: '🎉' });
    };

    const showAchievement = (title: string, message?: string) => {
        showToast({ type: 'achievement', title, message, icon: '🏆', duration: 5000 });
    };

    const showSecurityWin = (percentile?: number) => {
        const messages = [
            "You're now safer than most GitHub users!",
            `🔥 Security level: ${percentile || Math.floor(Math.random() * 30 + 65)}%`,
            "Fort Knox status: Activated 🛡️",
            "Hackers hate this one trick...",
        ];
        showToast({
            type: 'achievement',
            title: '🎉 Issue resolved!',
            message: messages[Math.floor(Math.random() * messages.length)],
            duration: 4500
        });
    };

    return {
        toasts,
        showToast,
        dismissToast,
        showSuccess,
        showAchievement,
        showSecurityWin
    };
}
