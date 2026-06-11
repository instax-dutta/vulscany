'use client';

import { useState } from 'react';
import { Terminal, Copy, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function RemediationBlock() {
    const [platform, setPlatform] = useState<'unix' | 'windows'>('unix');
    const [copied, setCopied] = useState(false);

    const commands = {
        unix: 'npm audit fix --force && npm update',
        windows: 'npm audit fix --force; npm update' // PowerShell friendly
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(commands[platform]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-black/40 border border-red-500/20 rounded-xl p-4 mb-8 w-full max-w-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-bold font-mono text-red-500 uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="w-3 h-3" /> Remediation
                </div>
                <div className="flex bg-white/5 rounded-lg p-0.5">
                    <button
                        onClick={() => setPlatform('unix')}
                        className={`px-2 py-0.5 rounded-md text-[9px] font-mono transition-all ${platform === 'unix'
                            ? 'bg-red-500/20 text-red-400 font-bold'
                            : 'text-white/40 hover:text-white/60'
                        }`}
                    >
                        UNIX
                    </button>
                    <button
                        onClick={() => setPlatform('windows')}
                        className={`px-2 py-0.5 rounded-md text-[9px] font-mono transition-all ${platform === 'windows'
                            ? 'bg-red-500/20 text-red-400 font-bold'
                            : 'text-white/40 hover:text-white/60'
                        }`}
                    >
                        WIN
                    </button>
                </div>
            </div>

            <div className="relative group">
                <code className="text-xs text-red-200/70 font-mono break-all bg-white/5 p-3 pr-10 rounded-lg block border border-white/5">
                    {commands[platform]}
                </code>
                <button
                    onClick={handleCopy}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {copied ? (
                            <motion.div
                                key="check"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="copy"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                            >
                                <Copy className="w-3.5 h-3.5" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </div>

            <p className="text-[9px] text-white/30 mt-2 italic font-mono flex items-center justify-between">
                <span>Run in terminal to apply fixes</span>
                <span className="opacity-50">{platform === 'windows' ? 'PowerShell' : 'Bash / Zsh'}</span>
            </p>
        </div>
    );
}
