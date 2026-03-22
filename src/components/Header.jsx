import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X, User, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import appleLogo from '../assets/apple-logo.svg';
import googlePlayLogo from '../assets/google-play.svg';
import '../styles/index.css';
import '../styles/Header.css';


const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Explore', path: '/explore' },
  { name: 'Creators', path: '/creators' },
  { name: 'About', path: '/about' },
];

const socialLinks = [
  { name: 'twitter', href: '#' },
  { name: 'tiktok', href: '#' },
  { name: 'instagram', href: '#' },
];

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isLanding = !isAuthenticated;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // If authenticated, show a simple header (the Sidebar handles main nav)
  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* ─── Floating nav buttons ─── */}

      {/* Menu pill — left */}
      <motion.button
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
        className="header-menu-pill"
        style={{
          background: menuOpen
            ? 'rgba(255,255,255,0.12)'
            : 'rgba(30, 10, 60, 0.88)',
        }}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ scale: 1.04, boxShadow: '0 8px 28px rgba(0,0,0,0.22), inset 0 0 0 1px rgba(255,255,255,0.12)' }}
        whileTap={{ scale: 0.97 }}
      >
        <motion.span
          animate={{ rotate: menuOpen ? 90 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex' }}
        >
          {menuOpen ? <X size={16} strokeWidth={2.5} /> : <Menu size={16} strokeWidth={2.5} />}
        </motion.span>
        <motion.span
          key={menuOpen ? 'close' : 'menu'}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </motion.span>
      </motion.button>

      {/* Login pill — right */}
      <motion.div
        style={{
          position: 'fixed',
          top: 'clamp(12px, 3vw, 24px)',
          right: 'clamp(12px, 3vw, 24px)',
          zIndex: 100,
          display: 'flex',
          gap: 'clamp(6px, 1.5vw, 10px)',
        }}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Store icons — hidden on tiny screens via CSS */}
        <div className="header-store-icons">
          {/* App Store — real logo */}
          <motion.a
            href="#"
            aria-label="Download on App Store"
            title="Download on the App Store"
            whileHover={{ scale: 1.2, opacity: 1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            style={{
              opacity: 0.65,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', flexShrink: 0,
            }}
          >
            <img src={appleLogo} alt="App Store" style={{ height: 24, width: 'auto', display: 'block' }} />
          </motion.a>

          {/* Google Play — real logo */}
          <motion.a
            href="#"
            aria-label="Get it on Google Play"
            title="Get it on Google Play"
            whileHover={{ scale: 1.2, opacity: 1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            style={{
              opacity: 0.65,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', flexShrink: 0,
            }}
          >
            <img src={googlePlayLogo} alt="Google Play" style={{ height: 24, width: 'auto', display: 'block' }} />
          </motion.a>
        </div>

        {/* Login pill */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link
            to="/login"
            aria-label="Login"
            className="header-login-pill"
          >
            <User size={15} strokeWidth={2.5} />
            Log In
          </Link>
        </motion.div>
      </motion.div>


      {/* ─── Fullscreen Menu Overlay ─── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 95,
              backgroundColor: 'var(--color-dark-green)',
              display: 'flex',
              flexDirection: 'row',
              padding: '80px 40px 40px',
              overflow: 'hidden',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Left — Navigation links */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', perspective: 600 }}>
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ y: 60, opacity: 0, rotateX: 45 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  exit={{ y: 30, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setMenuOpen(false)}
                    className="font-display"
                    style={{
                      fontSize: 'clamp(36px, 6vw, 64px)',
                      color: location.pathname === link.path ? 'var(--color-accent)' : 'white',
                      display: 'block',
                      padding: '8px 0',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      lineHeight: 1.1,
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--color-accent)'}
                    onMouseLeave={(e) => {
                      if (location.pathname !== link.path) {
                        e.target.style.color = 'white';
                      }
                    }}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              {/* Auth buttons in menu */}
              <motion.div
                className="header-auth-buttons"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ marginTop: 'clamp(24px, 4vw, 40px)', display: 'flex', gap: 'clamp(8px, 2vw, 16px)', flexWrap: 'wrap' }}
              >
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="header-auth-btn header-login-btn"
                  style={{ 
                    background: 'var(--color-accent)', 
                    color: 'white', 
                    textDecoration: 'none',
                    flex: '1 1 auto',
                    minWidth: '120px'
                  }}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="header-auth-btn header-signup-btn"
                  style={{ 
                    background: 'transparent', 
                    color: 'white', 
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    textDecoration: 'none',
                    flex: '1 1 auto',
                    minWidth: '120px'
                  }}
                >
                  Sign Up
                </Link>
              </motion.div>
            </div>

            {/* Right — Info panel */}
            <motion.div
              className="header-menu-right-panel"
              style={{ width: 'clamp(200px, 100%, 340px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* CTA card */}
              <div
                className="header-cta-card"
                style={{
                  borderRadius: 'clamp(16px, 3vw, 24px)',
                  padding: 'clamp(20px, 4vw, 32px)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <h3 className="font-display" style={{ fontSize: 'clamp(16px, 4vw, 20px)', color: 'white', marginBottom: 'clamp(8px, 2vw, 12px)', letterSpacing: '-0.02em' }}>
                  START EARNING TODAY
                </h3>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(12px, 2vw, 13px)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 'clamp(16px, 3vw, 20px)' }}>
                  Join thousands of creators already monetizing their influence with Dropp. Curate, share, and earn.
                </p>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="header-cta-btn"
                  style={{ background: 'var(--color-accent)', color: 'white', width: '100%', textDecoration: 'none', display: 'block', padding: 'clamp(10px, 2vw, 14px) clamp(14px, 3vw, 20px)', borderRadius: '8px', fontSize: 'clamp(11px, 2vw, 13px)', fontWeight: 700, textAlign: 'center', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 16px rgba(240, 5, 122, 0.3)' }}
                >
                  Get Started Free
                </Link>
              </div>

              {/* Social links */}
              <motion.div
                className="header-social-links"
                style={{ display: 'flex', gap: 'clamp(12px, 2.5vw, 20px)', marginTop: 'clamp(24px, 4vw, 40px)', flexWrap: 'wrap' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {socialLinks.map(link => (
                  <a
                    key={link.name}
                    href={link.href}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'clamp(11px, 1.8vw, 13px)',
                      color: 'rgba(255,255,255,0.5)',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      textTransform: 'capitalize',
                    }}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                  >
                    {link.name}
                  </a>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
