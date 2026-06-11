'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';

interface PRSuccessModalProps {
    show: boolean;
    prResult: { prUrl: string; prNumber: number; branch: string } | null;
    currentRepoKey: string | null;
    onDismiss: () => void;
}

export function PRSuccessModal({
    show,
    prResult,
    currentRepoKey,
    onDismiss,
}: PRSuccessModalProps) {
    if (!show || !prResult || !currentRepoKey) return null;

    return (
        <AnimatePresence>
            {show && prResult && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
                    onClick={onDismiss}
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
                                    onClick={onDismiss}
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
        </AnimatePresence>
    );
}
