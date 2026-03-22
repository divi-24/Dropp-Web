import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ArchVideoCarousel from './ArchVideoCarousel';
import '../styles/Landing.css';

const Hero = () => {
  const sectionRef = useRef(null);

  return (
    <section
      ref={sectionRef}
      className="hero-landing landing-section"
      style={{ backgroundColor: 'var(--color-beige)', overflow: 'hidden' }}
    >
      {/* ── TOP: DROPP wordmark ── */}
      <motion.div
        className="hero-wordmark-top"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.span
          className="hero-tag-pill"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Sparkles size={11} />
          Creator affiliate platform
        </motion.span>

        {/* DROPP letters — each animate in separately */}
        <div className="hero-dropp-wordmark">
          {'DROPP'.split('').map((char, i) => (
            <motion.span
              key={i}
              className="hero-dropp-char"
              initial={{ opacity: 0, y: 40, rotateX: 60 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.3 + i * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>

        <motion.p
          className="hero-tagline"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          Curate. Share. <span className="hero-tagline-accent">Earn.</span>
        </motion.p>
      </motion.div>

      {/* ── CENTRE: Arch Video Carousel ── */}
      <ArchVideoCarousel />

      {/* ── BOTTOM: Original subtitle ── */}
      <motion.div
        className="hero-cta-strip"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.1 }}
        style={{ alignItems: 'flex-end' }}
      >
        {/* Left: stacked CURATE / SHARE EARN */}
        <div className="hero-cta-left">
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 14,
              color: 'var(--color-deep, #1E0A3C)',
              opacity: 0.5,
              display: 'block',
              marginBottom: 4,
              letterSpacing: '0.02em',
            }}
          >
            Creator affiliate platform
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 900,
              color: 'var(--color-deep, #1E0A3C)',
              display: 'block',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
            }}
          >
            CURATE.
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 900,
              color: 'var(--color-accent)',
              display: 'block',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
            }}
          >
            SHARE. EARN.
          </span>
        </div>

        {/* Right: featured creator card (aurora gradient) */}
        <motion.div
          className="hero-featured-card"
          whileHover={{ y: -4, boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}
          transition={{ duration: 0.3 }}
        >
          <span className="hero-featured-tag">FEATURED CREATOR</span>
          <div className="hero-featured-title">TOP PICKS</div>
          <div className="hero-featured-sub">Curated collection</div>
          <Link to="/explore" className="hero-featured-btn">
            Explore <ArrowRight size={13} />
          </Link>
        </motion.div>
      </motion.div>

      {/* floating emoji bubbles */}
      {[
        { emoji: '🛍️', top: '22%', left: '3%', delay: 0.9 },
        { emoji: '💖', bottom: '25%', left: '5%', delay: 1.1 },
        { emoji: '🔥', top: '28%', right: '3%', delay: 1.0 },
        { emoji: '⚡', bottom: '28%', right: '5%', delay: 1.2 },
      ].map((b, i) => (
        <motion.div
          key={i}
          className="hero-emoji-bubble"
          style={{ top: b.top, left: b.left, right: b.right, bottom: b.bottom }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: b.delay, ease: [0.16, 1, 0.3, 1] }}
        >
          {b.emoji}
        </motion.div>
      ))}
    </section>
  );
};

export default Hero;
