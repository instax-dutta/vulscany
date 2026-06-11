'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getRandomTip } from '@/lib/education';

export function SecurityTipBanner() {
    const [tip, setTip] = useState('');

    useEffect(() => {
        setTip(getRandomTip());
        const interval = setInterval(() => setTip(getRandomTip()), 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            key={tip}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                fontSize: '0.75rem',
                color: 'var(--primary)',
                textAlign: 'center'
            }}
        >
            {tip}
        </motion.div>
    );
}
