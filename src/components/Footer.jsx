import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import '../styles/Landing.css';

const footerLinks = {
  Product: ['Features', 'Creators', 'App Download', 'Pricing'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Legal: ['Privacy Policy', 'Terms of Use', 'Cookie Policy'],
};

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'LinkedIn', icon: Linkedin, href: '#' },
  { name: 'YouTube', icon: Youtube, href: '#' },
];

const Footer = () => {
  return (
    <footer style={{ background: '#0C0618', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient glow */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,5,122,0.07), transparent)', top: '10%', right: '10%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,29,150,0.08), transparent)', bottom: '20%', left: '5%', filter: 'blur(80px)' }} />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1rem, 4vw, 40px)', position: 'relative', zIndex: 2 }}>

        {/* Top — CTA row */}
        <div style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 'clamp(40px, 8vw, 80px)', paddingBottom: 'clamp(40px, 8vw, 64px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'clamp(16px, 4vw, 24px)', flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 12 }}>
              Start for free
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1,
              margin: 0,
            }}>
              Ready to start earning?
            </h2>
          </div>
          <motion.a href="/login" whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 'clamp(6px, 2vw, 10px)',
              padding: 'clamp(12px, 2vw, 16px) clamp(20px, 4vw, 32px)', borderRadius: 999,
              background: 'var(--color-accent)', color: 'white',
              fontFamily: 'var(--font-sans)', fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: 700,
              textDecoration: 'none', letterSpacing: '0.02em', whiteSpace: 'nowrap',
              boxShadow: '0 4px 32px rgba(240,5,122,0.4)',
            }}
          >
            Get Started
          </motion.a>
        </div>

        {/* Middle — 4-col grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'clamp(1fr, 100vw, 2fr 1fr 1fr 1fr)',
          gap: 'clamp(24px, 4vw, 48px)', paddingTop: 'clamp(40px, 8vw, 64px)', paddingBottom: 'clamp(40px, 8vw, 64px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }} className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900,
                color: 'white', letterSpacing: '-0.05em', marginBottom: 'clamp(12px, 2vw, 16px)',
              }}>
                DROPP
              </div>
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: 'clamp(12px, 2vw, 14px)', lineHeight: 1.75,
                color: 'rgba(255,255,255,0.35)', maxWidth: 260, marginBottom: 'clamp(16px, 3vw, 28px)',
              }}>
                The all-in-one creator affiliate platform. Curate drops, share links, earn from every recommendation.
              </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {socialLinks.map(({ name, icon: Icon, href }) => (
                <motion.a key={name} href={href} aria-label={name}
                  whileHover={{ scale: 1.12, y: -2 }} whileTap={{ scale: 0.95 }}
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(240,5,122,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(240,5,122,0.3)';
                    e.currentTarget.style.color = 'var(--color-accent)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                  }}
                >
                  <Icon size={15} strokeWidth={1.8} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <div style={{
                fontFamily: 'var(--font-sans)', fontSize: 'clamp(9px, 2vw, 11px)', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)', marginBottom: 'clamp(12px, 2vw, 20px)',
              }}>{section}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2vw, 14px)' }}>
                {links.map(link => (
                  <li key={link}>
                    <motion.a href="#" whileHover={{ x: 4 }}
                      style={{
                        fontFamily: 'var(--font-sans)', fontSize: 'clamp(12px, 2vw, 14px)',
                        color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
                        transition: 'color 0.2s ease', display: 'inline-block',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'white'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                    >{link}</motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Giant wordmark */}
        <div style={{ width: '100%', textAlign: 'center', padding: 'clamp(30px, 6vw, 60px) 0 clamp(24px, 4vw, 48px)' }}>
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(60px, 15vw, 280px)',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              textTransform: 'uppercase',
              lineHeight: 0.85,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.0) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              WebkitTextStroke: '1px rgba(255,255,255,0.3)',
              userSelect: 'none',
              display: 'inline-block',
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))',
            }}
          >
            DROPP
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: 'clamp(16px, 3vw, 24px) 0 clamp(24px, 4vw, 40px)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 'clamp(8px, 2vw, 12px)',
        }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(10px, 2vw, 12px)', color: 'rgba(255,255,255,0.2)' }}>
            © {new Date().getFullYear()} Dropp Inc. All rights reserved.
          </span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(10px, 2vw, 12px)', color: 'rgba(255,255,255,0.2)' }}>
            Made with ♥ in India
          </span>
          <div style={{ display: 'flex', gap: 'clamp(12px, 3vw, 20px)' }}>
            {['Privacy', 'Terms', 'Cookies'].map(item => (
              <a key={item} href="#" style={{
                fontFamily: 'var(--font-sans)', fontSize: 'clamp(10px, 2vw, 12px)',
                color: 'rgba(255,255,255,0.25)', textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
              >{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
