import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import '../styles/ArchVideoCarousel.css';

/* ─── Image data ─── */
const slides = [
    {
        id: 1,
        title: 'Premium Shoes',
        desc: 'Discover trending curated drops',
        accent: '#FF2D78',
        image: '/img/shoes.jpeg',
    },
    {
        id: 2,
        title: "Fashion Inspiration",
        desc: 'Showcase your unique style',
        accent: '#7C3AED',
        image: '/img/Fashion Inspiration  -  Instagram Influencer.jpeg',
    },
    {
        id: 3,
        title: 'Fashion Drop',
        desc: 'Beautiful product pages',
        accent: '#0EA5E9',
        image: '/img/_ (9).jpeg',
    },
    {
        id: 4,
        title: 'Premium Collection',
        desc: 'Share to every platform',
        accent: '#10B981',
        image: '/img/_ (10).jpeg',
    },
    {
        id: 5,
        title: 'Exclusive Picks',
        desc: 'Engage & grow together',
        accent: '#F59E0B',
        image: '/img/_ (13).jpeg',
    },
    {
        id: 6,
        title: 'Trending Now',
        desc: 'Curate the best drops',
        accent: '#EF4444',
        image: '/img/_ (14).jpeg',
    },
];

const TOTAL = slides.length;
const AUTO_SPEED = 0.50; // px per frame

/**
 * Parabolic arch: compute Y offset & rotation for a card based on its
 * normalised position (-1…0…+1) within the visible window.
 *   - Center (0)  → highest point (Y = 0), no rotation
 *   - Edges (±1)  → lowest point (Y = archHeight), max rotation
 */
const getArch = (normPos) => {
    const archHeight = 120;  // px drop from center to edge
    const maxRotate = 12;    // degrees at far edge
    const y = normPos * normPos * archHeight;
    const rotate = normPos * maxRotate;
    // Slight scale reduction at edges for depth
    const scale = 1 - Math.abs(normPos) * 0.08;
    return { y, rotate, scale };
};

const ArchVideoCarousel = () => {
     const trackRef = useRef(null);
     const rafRef = useRef(null);
     const offsetRef = useRef(0);
     const [isPaused, setIsPaused] = useState(false);
     const isDraggingRef = useRef(false);
     const dragStartRef = useRef(0);
     const velocityRef = useRef(0);
     const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

     // Triple the slides for seamless infinite loop
     const allSlides = [...slides, ...slides, ...slides];
     
     // Responsive card width
     const getCardWidth = () => {
          if (window.innerWidth < 600) return 176; // mobile: 160px + 16px gap
          if (window.innerWidth < 900) return 224; // tablet: 200px + 24px gap
          return 268; // desktop: 232px + 36px gap
     };
     
     const cardWidth = getCardWidth();
     const singleSetWidth = TOTAL * cardWidth;

    /* ── Handle window resize ── */
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    /* ── Animation loop ── */
    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        const animate = () => {
            if (!isDraggingRef.current && !isPaused) {
                offsetRef.current -= AUTO_SPEED;
            }

            // Wrap offset for seamless loop
            if (offsetRef.current <= -singleSetWidth) {
                offsetRef.current += singleSetWidth;
            } else if (offsetRef.current > 0) {
                offsetRef.current -= singleSetWidth;
            }

            track.style.transform = `translateX(${offsetRef.current}px)`;

            // Apply arch transforms to each card
            const cards = track.children;
            const viewportCenter = window.innerWidth / 2;
            
            // Reduce arch effect on mobile for better UX
            const archMultiplier = isMobile ? 0.6 : 1;

            for (let i = 0; i < cards.length; i++) {
                const card = cards[i];
                const rect = card.getBoundingClientRect();
                const cardCenter = rect.left + rect.width / 2;
                const distFromCenter = cardCenter - viewportCenter;
                const normPos = Math.max(-1, Math.min(1, distFromCenter / (window.innerWidth * 0.45)));

                const { y, rotate, scale } = getArch(normPos);
                card.style.transform = `translateY(${-y * archMultiplier}px) rotate(${rotate * archMultiplier}deg) scale(${scale})`;
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [isPaused, singleSetWidth, isMobile]);

    /* ── Drag handlers ── */
    const handlePointerDown = useCallback((e) => {
        isDraggingRef.current = true;
        dragStartRef.current = e.clientX;
        velocityRef.current = 0;
        e.currentTarget.setPointerCapture(e.pointerId);
    }, []);

    const handlePointerMove = useCallback((e) => {
        if (!isDraggingRef.current) return;
        const dx = e.clientX - dragStartRef.current;
        dragStartRef.current = e.clientX;
        offsetRef.current += dx;
        velocityRef.current = dx;
    }, []);

    const handlePointerUp = useCallback(() => {
        isDraggingRef.current = false;
        // Apply momentum
        const applyMomentum = () => {
            if (Math.abs(velocityRef.current) < 0.5) return;
            velocityRef.current *= 0.92;
            offsetRef.current += velocityRef.current;
            requestAnimationFrame(applyMomentum);
        };
        requestAnimationFrame(applyMomentum);
    }, []);

    /* ── Wheel scrolling ── */
    const handleWheel = useCallback((e) => {
        e.preventDefault();
        offsetRef.current -= e.deltaY * 0.5;
    }, []);

    useEffect(() => {
        const el = trackRef.current?.parentElement;
        if (!el) return;
        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    /* ── Handle hover (pause carousel on hover) ── */
     const handleCardEnter = () => {
         setIsPaused(true);
     };

     const handleCardLeave = () => {
         setIsPaused(false);
     };

    return (
        <motion.div
            className="arch-carousel"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            <div className="arch-carousel-track" ref={trackRef}>
                 {allSlides.map((slide, i) => (
                     <div
                         key={`${slide.id}-${i}`}
                         className="arch-card"
                         onMouseEnter={handleCardEnter}
                         onMouseLeave={handleCardLeave}
                     >
                         <img
                             src={slide.image}
                             alt={slide.title}
                             loading="lazy"
                             className="arch-card-image"
                         />

                         {/* Hover overlay */}
                         <div className="arch-card-overlay">
                             <h4 className="arch-card-title">{slide.title}</h4>
                             <p className="arch-card-desc">{slide.desc}</p>
                         </div>

                         {/* Accent dot */}
                         <div
                             className="arch-card-accent"
                             style={{ color: slide.accent, background: slide.accent }}
                         />
                     </div>
                 ))}
             </div>
        </motion.div>
    );
};

export default ArchVideoCarousel;
