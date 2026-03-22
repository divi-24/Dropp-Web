import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Landing.css';

const expertises = [
  {
    title: 'Curate Collections',
    number: '01',
    desc: 'Build stunning product collections from your favorite brands. Organize by style, season, or mood — your audience gets a shoppable gallery they love.',
    tags: ['Product curation', 'Brand partnerships', 'Mood boards', 'Seasonal picks', 'Style guides'],
  },
  {
    title: 'Share & Earn',
    number: '02',
    desc: 'Generate affiliate links for every product you recommend. Share across all platforms and earn commission on every sale — automatically tracked.',
    tags: ['Affiliate links', 'Revenue tracking', 'Multi-platform sharing', 'Analytics dashboard', 'Payout management'],
  },
  {
    title: 'Grow Your Brand',
    number: '03',
    desc: 'Build a store that represents you. Customize your creator profile, gain followers, and establish yourself as a trusted voice in your niche.',
    tags: ['Creator profiles', 'Follower growth', 'Brand identity', 'Social integration', 'Community building'],
  },
];

const Features = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      className="features-section landing-section"
      style={{ backgroundColor: 'var(--color-beige)', padding: '140px 0' }}
    >
      <div className="landing-container">
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'clamp(1fr, 100vw, 1fr 1fr)', gap: 'clamp(40px, 6vw, 60px)', marginBottom: 'clamp(40px, 8vw, 80px)', alignItems: 'end' }} className="features-header">
          <div>
            <motion.span
              className="section-label"
              style={{ color: 'var(--color-accent)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              EXPERTISES
            </motion.span>
            <motion.h2
              className="font-display"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)', color: 'var(--color-dark-green)', marginTop: 16 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              EVERYTHING<br />YOU NEED.
            </motion.h2>
          </div>
          <motion.p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(13px, 2.5vw, 15px)',
              lineHeight: 1.8,
              color: 'rgba(0,77,44,0.6)',
              maxWidth: 400,
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            From curation to monetization, Dropp gives creators every tool they need to turn their taste into income.
          </motion.p>
        </div>

        {/* Accordion */}
        <div>
          {expertises.map((item, i) => (
            <motion.div
              key={i}
              className="feature-accordion-item"
              style={{ borderColor: 'rgba(0,77,44,0.1)' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div
                className="feature-accordion-header"
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'var(--color-accent)',
                      minWidth: 28,
                    }}
                  >
                    {item.number}
                  </span>
                  <h3
                    className="font-display"
                    style={{
                      fontSize: 'clamp(20px, 3vw, 32px)',
                      color: 'var(--color-dark-green)',
                      lineHeight: 1.2,
                    }}
                  >
                    {item.title}
                  </h3>
                </div>
                <div
                  className="feature-accordion-toggle"
                  style={{
                    background: openIndex === i ? 'var(--color-accent)' : 'transparent',
                    color: openIndex === i ? 'white' : 'var(--color-dark-green)',
                    border: openIndex === i ? 'none' : '1px solid rgba(0,77,44,0.2)',
                  }}
                >
                  {openIndex === i ? '−' : '+'}
                </div>
              </div>

              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ paddingBottom: 32, paddingLeft: 48 }}>
                      <p style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 14,
                        lineHeight: 1.8,
                        color: 'rgba(0,77,44,0.6)',
                        maxWidth: 500,
                        marginBottom: 20,
                      }}>
                        {item.desc}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {item.tags.map((tag, j) => (
                          <span
                            key={j}
                            className="tag-pill"
                            style={{
                              background: 'var(--color-dark-green)',
                              color: 'white',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
