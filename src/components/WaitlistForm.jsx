import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Sparkles, Users, TrendingUp, Zap } from 'lucide-react';
import '../styles/Landing.css';

const WaitlistForm = () => {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [formData, setFormData] = useState({ role: '', interest: '', email: '', name: '' });

  const roles = ['Creator', 'Brand', 'Influencer', 'Blogger', 'Business'];
  const interests = ['Fashion', 'Tech', 'Beauty', 'Fitness', 'Food', 'Lifestyle', 'Home', 'Travel'];

  const stats = [
    { icon: Users, value: '10K+', label: 'Creators Waiting' },
    { icon: TrendingUp, value: '₹2Cr+', label: 'Affiliate Revenue' },
    { icon: Zap, value: '< 1 min', label: 'To Sign Up' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setDone(true);
  };

  const canNext = (step === 0 && !!formData.role) || (step === 1 && !!formData.interest);

  return (
    <section
      style={{
        background: 'linear-gradient(160deg, #1E0A3C 0%, #2D1160 45%, #160830 100%)',
        padding: 'clamp(60px, 10vw, 100px) 0 clamp(80px, 12vw, 120px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,5,122,0.15), transparent)', top: '-15%', right: '-8%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent)', bottom: '-10%', left: '-5%', filter: 'blur(80px)' }} />
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(1rem, 3vw, 40px)', position: 'relative', zIndex: 2 }}>

        {/* Split layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'clamp(250px, 100%, 1fr) clamp(250px, 100%, 1.1fr)', gap: 'clamp(24px, 4vw, 64px)', alignItems: 'center' }}>

          {/* ── Left column ── */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ marginBottom: 24 }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 999,
                background: 'rgba(240,5,122,0.15)',
                border: '1px solid rgba(240,5,122,0.3)',
                fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FF80C0',
              }}>
                <Sparkles size={11} /> Early Access
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 6vw, 80px)',
                fontWeight: 900,
                color: 'white',
                lineHeight: 0.9,
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
                marginBottom: 'clamp(12px, 2vw, 24px)',
              }}
            >
              JOIN THE<br />
              <span style={{ color: 'var(--color-accent)' }}>DROP.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              style={{
                fontFamily: 'var(--font-sans)', fontSize: 'clamp(14px, 2vw, 16px)',
                color: 'rgba(255,255,255,0.45)', lineHeight: 1.8,
                maxWidth: 380, marginBottom: 'clamp(24px, 4vw, 48px)',
              }}
            >
              Be first in line. 3 quick questions, under a minute and you're in.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vw, 20px)' }}
            >
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2vw, 16px)' }}>
                  <div style={{
                    width: 'clamp(36px, 6vw, 40px)', height: 'clamp(36px, 6vw, 40px)', borderRadius: 12,
                    background: 'rgba(240,5,122,0.12)',
                    border: '1px solid rgba(240,5,122,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-accent)', flexShrink: 0,
                  }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{value}</div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(11px, 1.5vw, 12px)', color: 'rgba(255,255,255,0.35)' }}>{label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right column — Form card ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'clamp(20px, 4vw, 32px)',
              padding: 'clamp(24px, 4vw, 48px) clamp(20px, 4vw, 44px)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: 'center', padding: '40px 0' }}
                >
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
                    <CheckCircle2 size={64} color="var(--color-accent)" style={{ margin: '0 auto 20px' }} />
                  </motion.div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'white', marginBottom: 10, letterSpacing: '-0.02em' }}>
                    You&apos;re in!
                  </h3>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                    We&apos;ll reach out to <span style={{ color: 'var(--color-accent)' }}>{formData.email}</span> when we launch. 🎉
                  </p>
                </motion.div>
              ) : (
                <motion.div key="form">
                  {/* Progress */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 36 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 999,
                        background: i <= step ? 'var(--color-accent)' : 'rgba(255,255,255,0.08)',
                        transition: 'background 0.4s ease',
                        boxShadow: i <= step ? '0 0 8px rgba(240,5,122,0.5)' : 'none',
                      }} />
                    ))}
                  </div>

                  {/* Step counter */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                    <motion.p key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--color-accent)', margin: 0 }}
                    >
                      {step === 0 && 'I am a...'}
                      {step === 1 && "I'm into..."}
                      {step === 2 && 'Almost there!'}
                    </motion.p>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>
                      {step + 1} / 3
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    {step === 0 && (
                      <motion.div key="s0"
                        initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.28 }}
                        style={{ display: 'flex', flexWrap: 'wrap', gap: 10, minHeight: 120 }}
                      >
                        {roles.map(role => (
                          <motion.button key={role} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => setFormData({ ...formData, role })}
                            style={{
                              padding: 'clamp(8px, 1.5vw, 12px) clamp(14px, 2.5vw, 24px)', borderRadius: 999,
                              fontFamily: 'var(--font-sans)', fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 600, cursor: 'pointer',
                              border: '1.5px solid',
                              borderColor: formData.role === role ? 'var(--color-accent)' : 'rgba(255,255,255,0.12)',
                              background: formData.role === role ? 'var(--color-accent)' : 'rgba(255,255,255,0.04)',
                              color: formData.role === role ? 'white' : 'rgba(255,255,255,0.65)',
                              boxShadow: formData.role === role ? '0 0 20px rgba(240,5,122,0.3)' : 'none',
                              transition: 'all 0.25s ease',
                              minHeight: '44px',
                              WebkitTapHighlightColor: 'transparent',
                            }}
                          >{role}</motion.button>
                        ))}
                      </motion.div>
                    )}

                    {step === 1 && (
                      <motion.div key="s1"
                        initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.28 }}
                        style={{ display: 'flex', flexWrap: 'wrap', gap: 10, minHeight: 120 }}
                      >
                        {interests.map(interest => (
                          <motion.button key={interest} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => setFormData({ ...formData, interest })}
                            style={{
                              padding: 'clamp(8px, 1.5vw, 12px) clamp(14px, 2.5vw, 24px)', borderRadius: 999,
                              fontFamily: 'var(--font-sans)', fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 600, cursor: 'pointer',
                              border: '1.5px solid',
                              borderColor: formData.interest === interest ? 'var(--color-accent)' : 'rgba(255,255,255,0.12)',
                              background: formData.interest === interest ? 'var(--color-accent)' : 'rgba(255,255,255,0.04)',
                              color: formData.interest === interest ? 'white' : 'rgba(255,255,255,0.65)',
                              boxShadow: formData.interest === interest ? '0 0 20px rgba(240,5,122,0.3)' : 'none',
                              transition: 'all 0.25s ease',
                              minHeight: '44px',
                              WebkitTapHighlightColor: 'transparent',
                            }}
                          >{interest}</motion.button>
                        ))}
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.form key="s2" onSubmit={handleSubmit}
                        initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.28 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 120 }}
                      >
                        {[
                          { field: 'name', placeholder: 'Your name', type: 'text' },
                          { field: 'email', placeholder: 'your@email.com', type: 'email' },
                        ].map(({ field, placeholder, type }) => (
                          <input key={field} type={type} placeholder={placeholder}
                            value={formData[field]}
                            onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                            required
                            style={{
                              padding: 'clamp(12px, 2vw, 15px) clamp(14px, 2.5vw, 20px)', borderRadius: 14,
                              border: '1.5px solid rgba(255,255,255,0.1)',
                              background: 'rgba(255,255,255,0.05)',
                              color: 'white', fontFamily: 'var(--font-sans)', fontSize: 'clamp(13px, 2vw, 14px)',
                              outline: 'none', transition: 'border-color 0.2s ease',
                              minHeight: '44px',
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                          />
                        ))}
                        <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(4px, 1vw, 8px)',
                            padding: 'clamp(12px, 2vw, 15px) clamp(18px, 3vw, 28px)', borderRadius: 999,
                            background: 'var(--color-accent)', color: 'white', border: 'none',
                            fontFamily: 'var(--font-sans)', fontSize: 'clamp(12px, 1.8vw, 14px)', fontWeight: 700, cursor: 'pointer',
                            boxShadow: '0 4px 24px rgba(240,5,122,0.45)', marginTop: 4,
                            minHeight: '44px',
                            WebkitTapHighlightColor: 'transparent',
                          }}>
                          Join the Waitlist <ArrowRight size={16} />
                        </motion.button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Nav */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
                    <div>
                      {step > 0 && (
                        <button onClick={() => setStep(step - 1)} style={{
                          background: 'transparent', border: 'none',
                          fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
                          color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 0,
                        }}>← Back</button>
                      )}
                    </div>
                    {step < 2 && (
                      <motion.button
                        whileHover={canNext ? { scale: 1.05 } : {}}
                        whileTap={canNext ? { scale: 0.97 } : {}}
                        onClick={() => canNext && setStep(step + 1)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '12px 26px', borderRadius: 999, border: 'none',
                          background: canNext ? 'var(--color-accent)' : 'rgba(255,255,255,0.08)',
                          color: canNext ? 'white' : 'rgba(255,255,255,0.25)',
                          fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700,
                          cursor: canNext ? 'pointer' : 'not-allowed',
                          boxShadow: canNext ? '0 0 20px rgba(240,5,122,0.3)' : 'none',
                          transition: 'all 0.25s ease',
                        }}
                      >
                        Next <ArrowRight size={14} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Mobile responsive override */}
      <style>{`
        @media (max-width: 768px) {
          .waitlist-split { 
            grid-template-columns: 1fr !important;
            gap: clamp(20px, 3vw, 40px) !important;
          }
        }
        
        @media (max-width: 640px) {
          [style*="grid-template-columns: clamp"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

export default WaitlistForm;
