import React from 'react';
import { motion } from 'framer-motion';
import '../styles/Landing.css';

const reviews = [
  {
    name: 'Emma',
    role: 'Fashion Creator',
    quote: 'Dropp changed the way I share products. My audience actually shops what I recommend now.',
    top: '15%',
    left: '5%',
    rotate: -4,
    emoji: '👗',
  },
  {
    name: 'James',
    role: 'Tech Reviewer',
    quote: 'The affiliate tracking is seamless. I finally know exactly what converts.',
    top: '10%',
    right: '8%',
    rotate: 3,
    emoji: '🎧',
  },
  {
    name: 'Sofia',
    role: 'Lifestyle Blogger',
    quote: 'Beautiful collections, easy sharing, real earnings. What more could you want?',
    bottom: '20%',
    left: '10%',
    rotate: 2,
    emoji: '✨',
  },
  {
    name: 'Kai',
    role: 'Fitness Creator',
    quote: 'My supplement and gear collections earn me more than sponsorships now.',
    bottom: '15%',
    right: '5%',
    rotate: -3,
    emoji: '💪',
  },
];

const Reviews = () => {
  return (
    <section
      className="reviews-section landing-section"
      style={{ backgroundColor: 'var(--color-beige)', padding: '180px 0', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
    >
      {/* Giant centered text */}
      <motion.div
        className="reviews-big-text"
        style={{
          fontSize: 'clamp(48px, 9vw, 140px)',
          color: 'var(--color-dark-green)',
          maxWidth: 900,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          padding: '0 2rem',
        }}
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        CREATORS{' '}
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, textTransform: 'none' }}>
          love
        </span>{' '}
        DROPP
      </motion.div>

      {/* Scattered review cards */}
      {reviews.map((review, i) => (
        <motion.div
          key={i}
          className="review-card"
          style={{
            top: review.top,
            left: review.left,
            right: review.right,
            bottom: review.bottom,
            transform: `rotate(${review.rotate}deg)`,
            background: 'var(--color-dark-green)',
            color: 'white',
            width: 260,
            zIndex: 2,
          }}
          initial={{ opacity: 0, y: 40, rotate: review.rotate }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>{review.emoji}</div>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            lineHeight: 1.7,
            opacity: 0.8,
            marginBottom: 16,
          }}>
            &ldquo;{review.quote}&rdquo;
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
            }}>
              {review.name[0]}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600 }}>
                {review.name}
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, opacity: 0.5 }}>
                {review.role}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </section>
  );
};

export default Reviews;
