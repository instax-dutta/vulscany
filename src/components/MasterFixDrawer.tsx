'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, Copy, CheckCircle2, Shield, Info, Cpu, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { useState } from 'react';

interface MasterFixDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    prompt: string | null;
    onCopy: () => void;
    repoName?: string;
}

export function MasterFixDrawer({ isOpen, onClose, prompt, onCopy, repoName }: MasterFixDrawerProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (prompt) {
            navigator.clipboard.writeText(prompt);
            onCopy();
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#050505] border-l border-white/10 z-[101] flex flex-col shadow-2xl shadow-primary/20"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Shield className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white tracking-tight uppercase">Master Security Patch</h3>
                                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest leading-none">Protocol Analysis for {repoName}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/40 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-8">
                            {/* Guidance Box */}
                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex gap-4">
                                <div className="mt-1">
                                    <Info className="w-4 h-4 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider">How to implement</p>
                                    <p className="text-xs text-white/60 leading-relaxed font-mono">
                                        This protocol contains a comprehensive architectural fix for all detected vulnerabilities.
                                        Paste this payload into your AI-enabled IDE (Cursor, VS Code + Copilot) or standard AI Assistant (Claude 3.5 Sonnet / GPT-4o)
                                        to execute a multi-file security hardening procedure.
                                    </p>
                                </div>
                            </div>

                            {/* Prompt Execution Area */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em]">
                                        <Terminal className="w-3.5 h-3.5" /> Patch Payload
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono flex items-center gap-2 transition-all ${copied ? 'bg-emerald-500 text-black' : 'bg-primary text-black hover:scale-105'
                                        }`}
                                    >
                                        {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copied ? 'PAYLOAD COPIED' : 'COPY MASTER PROMPT'}
                                    </button>
                                </div>

                                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 font-mono text-[13px] leading-relaxed relative group">
                                    <div className="prose prose-invert prose-sm max-w-none text-white/60">
                                        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                                            {prompt || ''}
                                        </ReactMarkdown>
                                    </div>

                                    {/* Scan Context Badges */}
                                    <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-white/5">
                                        <div className="px-2 py-1 bg-white/5 rounded-md flex items-center gap-1.5">
                                            <Cpu className="w-3 h-3 text-white/40" />
                                            <span className="text-[10px] text-white/40 font-mono">ENCRYPTED DATA FLOW</span>
                                        </div>
                                        <div className="px-2 py-1 bg-white/5 rounded-md flex items-center gap-1.5">
                                            <Zap className="w-3 h-3 text-white/40" />
                                            <span className="text-[10px] text-white/40 font-mono">MULTI-FILE CONTEXT</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="p-6 border-t border-white/10 bg-black/40">
                            <button
                                onClick={handleCopy}
                                className="w-full py-4 bg-primary text-black font-black font-mono text-sm rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                            >
                                <Terminal className="w-5 h-5" />
                                {copied ? 'READY FOR IDE' : 'COPY MASTER FIX PROMPT'}
                            </button>
                            <p className="text-center mt-4 text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">
                                End of Protocol Analysis
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
