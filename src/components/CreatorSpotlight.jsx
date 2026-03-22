import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import '../styles/Landing.css';

/* ─── Row 1 (6 unique Indian creators) ─── */
const creatorsRow1 = [
  { name: 'Ananya Sharma', handle: '@ananyadrops', niche: 'Fashion & Lifestyle', followers: '320K', rating: 4.9, tags: ['Fashion', 'Streetwear'], gradient: 'linear-gradient(135deg, #F0057A, #FF80C0)', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop' },
  { name: 'Rohan Mehta', handle: '@rohanpicks', niche: 'Tech & Gadgets', followers: '180K', rating: 4.8, tags: ['Tech', 'Smart Home'], gradient: 'linear-gradient(135deg, #4F46E5, #818CF8)', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop' },
  { name: 'Priya Kapoor', handle: '@priyabeauty', niche: 'Beauty & Skincare', followers: '450K', rating: 5.0, tags: ['Skincare', 'Wellness'], gradient: 'linear-gradient(135deg, #7C3AED, #C4B5FD)', image: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=400&h=400&fit=crop' },
  { name: 'Arjun Nair', handle: '@arjunfinds', niche: 'Home & Living', followers: '210K', rating: 4.7, tags: ['Home Decor', 'Kitchen'], gradient: 'linear-gradient(135deg, #F59E0B, #FDE68A)', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
  { name: 'Meera Iyer', handle: '@meeralife', niche: 'Travel & Food', followers: '390K', rating: 4.9, tags: ['Travel', 'Food'], gradient: 'linear-gradient(135deg, #10B981, #6EE7B7)', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop' },
  { name: 'Kabir Singhania', handle: '@kabirfit', niche: 'Fitness & Wellness', followers: '270K', rating: 4.8, tags: ['Fitness', 'Nutrition'], gradient: 'linear-gradient(135deg, #EF4444, #FCA5A5)', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
];

/* ─── Row 2 (6 completely different Indian creators) ─── */
const creatorsRow2 = [
  { name: 'Isha Bhatia', handle: '@ishadrops', niche: 'Fashion & Style', followers: '295K', rating: 4.8, tags: ['OOTDs', 'Ethnic'], gradient: 'linear-gradient(135deg, #0EA5E9, #7DD3FC)', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop' },
  { name: 'Vikram Rao', handle: '@vikramtech', niche: 'Gadgets & Gaming', followers: '160K', rating: 4.7, tags: ['Gaming', 'Audio'], gradient: 'linear-gradient(135deg, #EC4899, #F9A8D4)', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop' },
  { name: 'Divya Menon', handle: '@divyaglow', niche: 'Ayurveda & Beauty', followers: '520K', rating: 5.0, tags: ['Ayurveda', 'Hair Care'], gradient: 'linear-gradient(135deg, #8B5CF6, #DDD6FE)', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop' },
  { name: 'Aditya Verma', handle: '@adityahome', niche: 'Interior Design', followers: '185K', rating: 4.6, tags: ['Decor', 'Minimalism'], gradient: 'linear-gradient(135deg, #F97316, #FDBA74)', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
  { name: 'Sneha Joshi', handle: '@snehafoods', niche: 'Food & Cooking', followers: '430K', rating: 4.9, tags: ['Recipes', 'Street Food'], gradient: 'linear-gradient(135deg, #14B8A6, #99F6E4)', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop' },
  { name: 'Rahul Gupta', handle: '@rahulfit', niche: 'Sports & Fitness', followers: '310K', rating: 4.8, tags: ['Yoga', 'Running'], gradient: 'linear-gradient(135deg, #6366F1, #C7D2FE)', image: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=400&h=400&fit=crop' },
];

const row1 = [...creatorsRow1, ...creatorsRow1];
const row2 = [...creatorsRow2, ...creatorsRow2];

/* ─── Single card — light theme ─── */
const CreatorCard = ({ creator }) => (
  <motion.div
    className="marquee-creator-card-light"
    whileHover={{ y: -6, scale: 1.02 }}
    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
  >
    {/* Avatar */}
    <div className="marquee-creator-avatar" style={{ background: creator.gradient, backgroundImage: `url('${creator.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {!creator.image && <span>{creator.initials}</span>}
      <div className="marquee-creator-verified">✓</div>
    </div>

    {/* Info */}
    <div className="marquee-creator-info">
      <div className="marquee-creator-name-dark">{creator.name}</div>
      <div className="marquee-creator-handle">{creator.handle}</div>
      <div className="marquee-creator-niche-dark">{creator.niche}</div>
    </div>

    {/* Stats */}
    <div className="marquee-creator-stats">
      <span className="marquee-creator-followers-dark">{creator.followers}</span>
      <span className="marquee-creator-rating">
        <Star size={11} fill="currentColor" />
        {creator.rating}
      </span>
    </div>

    {/* Tags */}
    <div className="marquee-creator-tags">
      {creator.tags.map((tag, i) => (
        <span key={i} className="marquee-creator-tag-light">{tag}</span>
      ))}
    </div>
  </motion.div>
);

const MarqueeRow = ({ items, reverse = false }) => (
  <div className="marquee-row-wrapper">
    <div className={`marquee-row-track ${reverse ? 'marquee-reverse' : ''}`}>
      {items.map((creator, i) => <CreatorCard key={i} creator={creator} />)}
    </div>
  </div>
);

/* ─── Section ─── */
const CreatorSpotlight = () => (
  <section
    className="creators-showcase landing-section"
    style={{ background: '#FDF8F3', padding: '120px 0', overflow: 'hidden' }}
  >
    {/* Header */}
    <div className="landing-container" style={{ marginBottom: 64 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <motion.span
            className="section-label"
            style={{ color: 'var(--color-accent)' }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            CREATORS
          </motion.span>
          <motion.h2
            className="font-display"
            style={{
              fontSize: 'clamp(36px, 6vw, 72px)',
              color: 'var(--color-deep, #1E0A3C)',   /* ← dark for light bg */
              marginTop: 14,
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            MEET OUR<br />
            <span style={{ color: 'var(--color-accent)' }}>CREATORS.</span>
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link
            to="/creators"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              borderRadius: 999,
              border: '1.5px solid rgba(30,10,60,0.15)',
              color: 'var(--color-deep, #1E0A3C)',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              background: 'white',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--color-accent)';
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = 'rgba(30,10,60,0.15)';
              e.currentTarget.style.color = 'var(--color-deep, #1E0A3C)';
            }}
          >
            View all creators <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>
    </div>

    {/* Marquee */}
    <div className="marquee-stage">
      <MarqueeRow items={row1} reverse={false} />
      <MarqueeRow items={row2} reverse={true} />
    </div>
  </section>
);

export default CreatorSpotlight;
