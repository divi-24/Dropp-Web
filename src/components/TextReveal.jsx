import React from 'react';
import { motion } from 'framer-motion';

const TextReveal = ({
    text,
    tag = 'h2',
    className = 'font-display',
    style = {},
    delay = 0,
    staggerDelay = 0.03,
    splitBy = 'word', // 'word' or 'char'
}) => {
    const Tag = motion[tag] || motion.div;
    const items = splitBy === 'char' ? text.split('') : text.split(' ');

    return (
        <Tag
            className={className}
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: splitBy === 'char' ? '0' : '0.3em',
                overflow: 'hidden',
                perspective: 600,
                ...style,
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
        >
            {items.map((item, i) => (
                <motion.span
                    key={i}
                    style={{
                        display: 'inline-block',
                        willChange: 'transform, opacity',
                    }}
                    variants={{
                        hidden: {
                            y: '110%',
                            opacity: 0,
                            rotateX: 60,
                        },
                        visible: {
                            y: 0,
                            opacity: 1,
                            rotateX: 0,
                            transition: {
                                duration: 0.8,
                                delay: delay + i * staggerDelay,
                                ease: [0.16, 1, 0.3, 1],
                            },
                        },
                    }}
                >
                    {item === ' ' ? '\u00A0' : item}
                </motion.span>
            ))}
        </Tag>
    );
};

export default TextReveal;
