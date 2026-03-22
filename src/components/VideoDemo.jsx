import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import '../styles/Landing.css';

const VideoDemo = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const scale = useTransform(scrollYProgress, [0, 0.4], [0.7, 1]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.4], [60, 20]);

  const wordVariants = {
    hidden: { opacity: 0, y: 40, rotateX: 45 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  const topWords = ['We', 'build', 'the', 'tools,'];
  const bottomWords = ['you', 'build', 'the', 'future.'];

  return (
    <section
      ref={sectionRef}
      className="impact-section landing-section"
      style={{ backgroundColor: 'var(--color-accent)', padding: '160px 0' }}
    >
      <div className="landing-container">
        {/* Top text */}
        <motion.div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.3em',
            justifyContent: 'center',
            perspective: 600,
            marginBottom: 60,
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {topWords.map((word, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={wordVariants}
              className="font-display"
              style={{
                fontSize: 'clamp(36px, 6vw, 72px)',
                color: 'white',
                display: 'inline-block',
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>

        {/* Video */}
        <motion.div
          className="impact-video-wrapper"
          style={{ scale, borderRadius, overflow: 'hidden' }}
        >
          <div
            style={{
              width: '100%',
              aspectRatio: '16/9',
              background: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom text */}
        <motion.div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.3em',
            justifyContent: 'center',
            perspective: 600,
            marginTop: 60,
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {bottomWords.map((word, i) => (
            <motion.span
              key={i}
              custom={i + topWords.length}
              variants={wordVariants}
              className="font-display"
              style={{
                fontSize: 'clamp(36px, 6vw, 72px)',
                color: 'white',
                display: 'inline-block',
                fontStyle: word === 'future.' ? 'italic' : 'normal',
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default VideoDemo;
