/**
 * Keyboard Shortcuts Handler
 * F: Autofix first issue | R: Rescan | ⌘+K: Open repo launcher
 */

'use client';

import { useEffect } from 'react';

export interface KeyboardShortcutHandlers {
    onFixFirst?: () => void;
    onRescan?: () => void;
    onOpenLauncher?: () => void;
}

export function useKeyboardShortcuts({
    onFixFirst,
    onRescan,
    onOpenLauncher
}: KeyboardShortcutHandlers) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            // F key: Fix first issue
            if (e.key === 'f' || e.key === 'F') {
                e.preventDefault();
                onFixFirst?.();
                return;
            }

            // R key: Rescan
            if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                onRescan?.();
                return;
            }

            // Cmd/Ctrl + K: Open launcher
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                onOpenLauncher?.();
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onFixFirst, onRescan, onOpenLauncher]);
}

// Visual keyboard shortcut hints component
export function KeyboardShortcutHints({ visible = true }: { visible?: boolean }) {
    if (!visible) return null;

    const shortcuts = [
        { key: 'F', label: 'Fix First', color: '#00ff88' },
        { key: 'R', label: 'Rescan', color: '#00ccff' },
        { key: '⌘ K', label: 'Launcher', color: '#ffaa00' }
    ];

    return (
        <div style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.75rem',
            padding: '0.75rem 1.25rem',
            background: 'rgba(10, 10, 15, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            zIndex: 1000,
            fontFamily: 'var(--font-mono)'
        }}>
            {shortcuts.map((shortcut, i) => (
                <div
                    key={i}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        paddingRight: i < shortcuts.length - 1 ? '0.75rem' : 0,
                        borderRight: i < shortcuts.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                    }}
                >
                    <kbd style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '0.375rem',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: shortcut.color,
                        minWidth: '1.75rem',
                        textAlign: 'center',
                        boxShadow: `0 0 10px ${shortcut.color}20`,
                        fontFamily: 'inherit'
                    }}>
                        {shortcut.key}
                    </kbd>
                    <span style={{
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        fontWeight: '600'
                    }}>
                        {shortcut.label}
                    </span>
                </div>
            ))}
        </div>
    );
}
