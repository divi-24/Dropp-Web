import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import WaitlistForm from '../components/WaitlistForm';
import Reviews from '../components/Reviews';
import AppDownload from '../components/AppDownload';
import VideoCarousel from '../components/VideoCarousel';
import CreatorSpotlight from '../components/CreatorSpotlight';
import Marquee from '../components/Marquee';
import { motion } from 'framer-motion';
import '../styles/Landing.css';

const Landing = () => {
    return (
        <motion.div
            className="landing-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ background: 'var(--color-beige)' }}
        >
            <Hero />

            {/* Marquee strip 1 — between Hero & VideoDemo */}
            <Marquee
                text="CURATE · SHARE · EARN"
                separator="◆"
                speed={25}
                bgColor="var(--color-dark-green)"
                textColor="white"
                accentColor="var(--color-accent)"
            />

            <VideoCarousel />
            <Features />

            {/* Marquee strip 2 — between Features & CreatorSpotlight */}
            <Marquee
                text="TOP CREATORS · EXCLUSIVE DROPS · AFFILIATE INCOME"
                separator="✦"
                speed={30}
                reverse
                bgColor="var(--color-accent)"
                textColor="white"
                accentColor="rgba(255,255,255,0.6)"
            />

            <CreatorSpotlight />

            {/* Marquee strip — after creators, pink bg */}
            <Marquee
                text="EARN WHILE YOU CREATE · LINK · DROP · EARN · CURATE THE BEST · JOIN 10K+ CREATORS · AFFILIATE MADE EASY"
                separator="★"
                speed={35}
                bgColor="var(--color-accent)"
                textColor="white"
                accentColor="rgba(255,255,255,0.5)"
                fontSize="clamp(14px, 2vw, 20px)"
            />

            <Reviews />

            {/* Marquee strip 3 — before impact banner */}
            <Marquee
                text="DROPP"
                separator="●"
                speed={20}
                bgColor="var(--color-dark-green)"
                textColor="white"
                accentColor="var(--color-accent)"
                fontSize="clamp(18px, 3vw, 28px)"
            />

            <AppDownload />
            <WaitlistForm />
        </motion.div>
    );
};

export default Landing;
