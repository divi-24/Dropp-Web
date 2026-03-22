import React from 'react';
import { motion } from 'framer-motion';
import '../styles/Landing.css';

/* ─── Official App Store Badge ─── */
const AppStoreBadge = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="156"
    height="52"
    viewBox="0 0 156 52"
    fill="none"
    aria-label="Download on the App Store"
  >
    <rect width="156" height="52" rx="10" fill="black" />
    <rect x="0.5" y="0.5" width="155" height="51" rx="9.5" stroke="white" strokeOpacity="0.2" />

    {/* Apple logo */}
    <path
      d="M28.64 25.77c-.03-3.37 2.75-5.01 2.87-5.08-1.57-2.29-4-2.6-4.85-2.63-2.05-.21-4.02 1.22-5.06 1.22-1.05 0-2.65-1.2-4.36-1.16-2.22.03-4.28 1.3-5.42 3.28-2.33 4.04-.59 10 1.66 13.27 1.12 1.6 2.44 3.4 4.17 3.33 1.69-.07 2.32-1.08 4.35-1.08 2.02 0 2.6 1.08 4.37 1.04 1.81-.03 2.95-1.63 4.04-3.24 1.29-1.85 1.81-3.67 1.83-3.76-.04-.01-3.5-1.34-3.54-5.2z"
      fill="white"
    />
    <path
      d="M25.34 16.8c.91-1.12 1.53-2.66 1.36-4.21-1.32.06-2.95.9-3.9 2-.84.97-1.59 2.54-1.39 4.04 1.48.11 2.99-.77 3.93-1.83z"
      fill="white"
    />

    {/* Text */}
    <text x="44" y="20" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="9" fill="rgba(255,255,255,0.75)" letterSpacing="0.03em">
      Download on the
    </text>
    <text x="44" y="36" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="18" fontWeight="600" fill="white">
      App Store
    </text>
  </svg>
);

/* ─── Official Google Play Badge ─── */
const GooglePlayBadge = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="176"
    height="52"
    viewBox="0 0 176 52"
    fill="none"
    aria-label="Get it on Google Play"
  >
    <rect width="176" height="52" rx="10" fill="black" />
    <rect x="0.5" y="0.5" width="175" height="51" rx="9.5" stroke="white" strokeOpacity="0.2" />

    {/* Google Play triangle icon (4-color) */}
    <path d="M14 14.5L28 26L14 37.5V14.5Z" fill="#00D2FF" />
    <path d="M14 14.5L28 26L21 19L14 14.5Z" fill="#00F076" />
    <path d="M14 37.5L28 26L21 33L14 37.5Z" fill="#FF3D5A" />
    <path d="M28 26L35 29.5L30 26L35 22.5L28 26Z" fill="#FFD700" />
    <path d="M14 14.5L30 26L35 22.5L14 14.5Z" fill="#00F076" />
    <path d="M14 37.5L30 26L35 29.5L14 37.5Z" fill="#FF3D5A" />

    {/* Text */}
    <text x="44" y="20" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="9" fill="rgba(255,255,255,0.75)" letterSpacing="0.03em">
      GET IT ON
    </text>
    <text x="44" y="36" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="18" fontWeight="600" fill="white">
      Google Play
    </text>
  </svg>
);

const AppDownload = () => {
  return (
    <section
      className="banner-section landing-section"
      style={{
        backgroundColor: 'var(--color-accent)',
        padding: '100px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Full-width scrolling text */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="banner-text-fill" style={{ textAlign: 'center' }}>
          <span
            className="font-display"
            style={{ fontSize: 'clamp(20px, 3vw, 32px)', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8 }}
          >
            THE POWER OF
          </span>
          <span
            className="font-display"
            style={{ fontSize: 'clamp(48px, 10vw, 160px)', color: 'white', display: 'block', lineHeight: 0.9 }}
          >
            YOUR INFLUENCE
          </span>
          <span
            className="font-display"
            style={{ fontSize: 'clamp(48px, 10vw, 160px)', color: 'rgba(255,255,255,0.2)', display: 'block', lineHeight: 0.9 }}
          >
            MONETIZED.
          </span>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        style={{ textAlign: 'center', marginTop: 60 }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 15,
          color: 'rgba(255,255,255,0.7)',
          maxWidth: 500,
          margin: '0 auto 36px',
          lineHeight: 1.7,
        }}>
          Download Dropp and start earning from the products you already love and recommend.
        </p>

        {/* Store badges */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          <motion.a
            href="#"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'inline-block',
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              lineHeight: 0,
              textDecoration: 'none',
            }}
            aria-label="Download on the App Store"
          >
            <AppStoreBadge />
          </motion.a>

          <motion.a
            href="#"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'inline-block',
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              lineHeight: 0,
              textDecoration: 'none',
            }}
            aria-label="Get it on Google Play"
          >
            <GooglePlayBadge />
          </motion.a>
        </div>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          color: 'rgba(255,255,255,0.35)',
          marginTop: 20,
          letterSpacing: '0.03em',
        }}>
          Free to download. Zero upfront cost.
        </p>
      </motion.div>
    </section>
  );
};

export default AppDownload;
