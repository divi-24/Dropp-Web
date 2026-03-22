import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const ringX = useSpring(cursorX, springConfig);
  const ringY = useSpring(cursorY, springConfig);

  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    // Check for touch device
    if ('ontouchstart' in window) return;

    const move = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.classList.contains('clickable') ||
        getComputedStyle(target).cursor === 'pointer'
      ) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = () => setIsHovering(false);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [cursorX, cursorY, dotX, dotY]);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null;
  }

  return (
    <>
      {/* Outer ring — follows with spring */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isHovering ? 56 : 36,
          height: isHovering ? 56 : 36,
          borderRadius: '50%',
          border: `1.5px solid ${isHovering ? 'var(--color-accent)' : 'var(--color-dark-green)'}`,
          pointerEvents: 'none',
          zIndex: 9998,
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isHovering ? 0.8 : 0.35,
          scale: isClicking ? 0.85 : 1,
          mixBlendMode: 'difference',
          transition: 'width 0.3s, height 0.3s, border-color 0.3s, opacity 0.3s',
        }}
      />

      {/* Inner dot — follows mouse directly */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isHovering ? 6 : 4,
          height: isHovering ? 6 : 4,
          borderRadius: '50%',
          background: isHovering ? 'var(--color-accent)' : 'var(--color-dark-green)',
          pointerEvents: 'none',
          zIndex: 9998,
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          scale: isClicking ? 2.5 : 1,
          transition: 'width 0.2s, height 0.2s, background 0.2s',
        }}
      />
    </>
  );
};

export default CustomCursor;
