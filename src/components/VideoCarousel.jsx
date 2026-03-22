import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import '../styles/VideoCarousel.css';

const slides = [
    {
        id: 1,
        title: 'Explore Future Collection',
        accent: '#FF2D78',
        video: '/videos/Dropp_Explore_Feature_Video_Generation.mp4',
    },
    {
        id: 2,
        title: "Creator's Profile",
        accent: '#7C3AED',
        video: '/videos/Dropp_Creator_Profile_Video_Generation.mp4',
    },
    {
        id: 3,
        title: 'Product Showcase',
        accent: '#0EA5E9',
        video: '/videos/Dropp_Product_Page_Video_Generation.mp4',
    },
    {
        id: 4,
        title: 'Social Sharing',
        accent: '#10B981',
        video: '/videos/Video_Generation_Dropp_Sharing_Capabilities.mp4',
    },
    {
        id: 5,
        title: 'Community & Engagement',
        accent: '#F59E0B',
        video: '/videos/Dropp_Community_Features_Video_Generation.mp4',
    },
    {
        id: 6,
        title: 'Collections',
        accent: '#EF4444',
        video: '/videos/Dropp_Collections_Video_Generation.mp4',
    },
];

const AUTO_ADVANCE_MS = 8000;

const VideoCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [progressKey, setProgressKey] = useState(0);   // resets progress bar CSS anim
    const videoRefs = useRef([]);
    const timerRef = useRef(null);
    const sectionRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    });
    // iPad scales up from 88% → 100% as it enters view
    const ipadScale = useTransform(scrollYProgress, [0, 0.35], [0.88, 1]);

    /* ─── Switch to slide i ─── */
    const goTo = useCallback((i) => {
        const next = ((i % slides.length) + slides.length) % slides.length;
        videoRefs.current.forEach((v, idx) => {
            if (!v) return;
            if (idx === next) { v.currentTime = 0; v.play().catch(() => { }); }
            else { v.pause(); }
        });
        setActiveIndex(next);
        setProgressKey(k => k + 1);   // restart progress bar
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => goTo(next + 1), AUTO_ADVANCE_MS);
    }, []); // eslint-disable-line

    /* ─── Mount: play first video + start timer ─── */
    useEffect(() => {
        const v = videoRefs.current[0];
        if (v) v.play().catch(() => { });
        timerRef.current = setTimeout(() => goTo(1), AUTO_ADVANCE_MS);
        return () => clearTimeout(timerRef.current);
    }, []); // eslint-disable-line

    /* ─── video ended → advance ─── */
    useEffect(() => {
        const cleanups = videoRefs.current.map((v, i) => {
            if (!v) return null;
            const fn = () => { if (i === activeIndex) goTo(activeIndex + 1); };
            v.addEventListener('ended', fn);
            return () => v.removeEventListener('ended', fn);
        });
        return () => cleanups.forEach(fn => fn && fn());
    }, [activeIndex, goTo]);

    /* ─── Word reveal variants ─── */
    const wordVariants = {
        hidden: { opacity: 0, y: 48, rotateX: 50 },
        visible: (i) => ({
            opacity: 1, y: 0, rotateX: 0,
            transition: { duration: 0.75, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] },
        }),
    };

    const topWords = ['We', 'build', 'the', 'tools,'];
    const bottomWords = ['you', 'build', 'the', 'future.'];

    return (
        <section
            ref={sectionRef}
            className="vc-section"
            style={{ backgroundColor: 'var(--color-accent)' }}
        >
            <div className="vc-inner">

                {/* ── Top heading ── */}
                <motion.div
                    className="vc-heading-row"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                >
                    {topWords.map((w, i) => (
                        <motion.span key={i} custom={i} variants={wordVariants} className="vc-word font-display">
                            {w}
                        </motion.span>
                    ))}
                </motion.div>

                {/* ── iPad stage ── */}
                <motion.div className="vc-ipad-stage" style={{ scale: ipadScale }}>

                    {/* Ambient glow — CSS color transition */}
                    <motion.div
                        className="vc-ambient-glow"
                        animate={{ background: slides[activeIndex].accent, scale: [1, 1.08, 1] }}
                        transition={{ background: { duration: 0.7 }, scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
                    />

                    {/* iPad frame entrance */}
                    <motion.div
                        className="ipad-pro-frame"
                        initial={{ opacity: 0, y: 60, scale: 0.92 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="ipad-pro-body">
                            <div className="ipad-screen-bezel">

                                {/* ALL VIDEOS stacked — opacity crossfade, no flash */}
                                {slides.map((slide, i) => (
                                    <div
                                        key={slide.id}
                                        className="ipad-slide-layer"
                                        style={{
                                            opacity: i === activeIndex ? 1 : 0,
                                            transition: 'opacity 0.5s ease',
                                        }}
                                    >
                                        <video
                                            ref={el => videoRefs.current[i] = el}
                                            className="ipad-video"
                                            src={slide.video}
                                            muted
                                            playsInline
                                            preload="auto"
                                        />
                                    </div>
                                ))}

                                {/* Animated title — slides up on change */}
                                <div className="ipad-bottom-overlay">
                                    <div className="ipad-bottom-overlay-blur" />

                                    {/* Animated progress bar */}
                                    <div className="ipad-progress-track">
                                        <motion.div
                                            key={progressKey}
                                            className="ipad-progress-bar"
                                            style={{ background: slides[activeIndex].accent }}
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ duration: AUTO_ADVANCE_MS / 1000, ease: 'linear' }}
                                        />
                                    </div>

                                    {/* Animated title text */}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeIndex}
                                            className="ipad-title-row"
                                            initial={{ opacity: 0, y: 14 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                        >
                                            <h4 className="ipad-title-text">{slides[activeIndex].title}</h4>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Prev button */}
                                <motion.button
                                    className="ipad-nav-btn ipad-nav-prev"
                                    onClick={() => goTo(activeIndex - 1)}
                                    aria-label="Previous video"
                                    whileHover={{ scale: 1.12, backgroundColor: 'rgba(0,0,0,0.65)' }}
                                    whileTap={{ scale: 0.88 }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </motion.button>

                                {/* Next button */}
                                <motion.button
                                    className="ipad-nav-btn ipad-nav-next"
                                    onClick={() => goTo(activeIndex + 1)}
                                    aria-label="Next video"
                                    whileHover={{ scale: 1.12, backgroundColor: 'rgba(0,0,0,0.65)' }}
                                    whileTap={{ scale: 0.88 }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </motion.button>

                            </div>
                        </div>
                    </motion.div>

                    {/* Animated dot indicators */}
                    <motion.div
                        className="vc-external-dots"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {slides.map((s, i) => (
                            <motion.button
                                key={i}
                                className={`vc-ext-dot ${i === activeIndex ? 'active' : ''}`}
                                onClick={() => goTo(i)}
                                whileHover={{ scale: 1.4 }}
                                whileTap={{ scale: 0.75 }}
                                animate={{
                                    background: i === activeIndex ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.35)',
                                    width: i === activeIndex ? 28 : 8,
                                    borderRadius: i === activeIndex ? 4 : 50,
                                }}
                                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                title={s.title}
                            />
                        ))}
                    </motion.div>

                </motion.div>

                {/* ── Bottom heading ── */}
                <motion.div
                    className="vc-heading-row"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                >
                    {bottomWords.map((w, i) => (
                        <motion.span
                            key={i}
                            custom={i + topWords.length}
                            variants={wordVariants}
                            className="vc-word font-display"
                            style={{ fontStyle: w === 'future.' ? 'italic' : 'normal' }}
                        >
                            {w}
                        </motion.span>
                    ))}
                </motion.div>

            </div>
        </section>
    );
};

export default VideoCarousel;
