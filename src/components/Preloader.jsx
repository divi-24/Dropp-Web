import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader = ({ onComplete }) => {
    const [phase, setPhase] = useState(0); // 0 = visible, 1 = text done, 2 = exit

    useEffect(() => {
        const t1 = setTimeout(() => setPhase(1), 1200);
        const t2 = setTimeout(() => setPhase(2), 2200);
        const t3 = setTimeout(() => onComplete?.(), 2800);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onComplete]);

    return (
        <AnimatePresence>
            {phase < 2 && (
                <motion.div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        background: 'var(--color-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: 16,
                    }}
                    exit={{ y: '-100%' }}
                    transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                >
                    {/* Logo text */}
                    <motion.div
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(48px, 10vw, 120px)',
                            fontWeight: 900,
                            color: 'white',
                            letterSpacing: '-0.04em',
                            textTransform: 'uppercase',
                            overflow: 'hidden',
                        }}
                    >
                        {'DROPP'.split('').map((char, i) => (
                            <motion.span
                                key={i}
                                style={{ display: 'inline-block' }}
                                initial={{ y: '100%', opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{
                                    duration: 0.6,
                                    delay: 0.2 + i * 0.06,
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                            >
                                {char}
                            </motion.span>
                        ))}
                    </motion.div>

                    {/* Subtitle */}
                    <motion.span
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: 16,
                            color: 'rgba(255,255,255,0.7)',
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                    >
                        curate · share · earn
                    </motion.span>

                    {/* Loading bar */}
                    <motion.div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            height: 3,
                            background: 'rgba(255,255,255,0.4)',
                        }}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Preloader;
