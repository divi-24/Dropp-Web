import React from 'react';
import { motion } from 'framer-motion';

const Marquee = ({
    text = 'DROPP',
    separator = '✦',
    speed = 30,
    reverse = false,
    bgColor = 'var(--color-dark-green)',
    textColor = 'white',
    accentColor = 'var(--color-accent)',
    fontSize = 'clamp(14px, 2vw, 20px)',
    extraStyle = {},
}) => {
    const items = Array(12).fill(null);

    return (
        <div
            style={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                background: bgColor,
                padding: '20px 0',
                position: 'relative',
                ...extraStyle,
            }}
        >
            <motion.div
                style={{
                    display: 'inline-flex',
                    gap: '0px',
                    willChange: 'transform',
                }}
                animate={{
                    x: reverse ? ['0%', '-50%'] : ['-50%', '0%'],
                }}
                transition={{
                    duration: speed,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: 'linear',
                }}
            >
                {items.map((_, i) => (
                    <span
                        key={i}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2em',
                            padding: '0 2em',
                            fontFamily: 'var(--font-display)',
                            fontSize,
                            fontWeight: 700,
                            color: textColor,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            flexShrink: 0,
                        }}
                    >
                        <span>{text}</span>
                        <span style={{ color: accentColor, fontSize: '0.7em' }}>{separator}</span>
                    </span>
                ))}
            </motion.div>
        </div>
    );
};

export default Marquee;
