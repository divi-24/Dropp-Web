/**
 * Generates a clean SVG placeholder image as a data URI.
 * Uses a subtle gradient with an optional initial letter.
 */

const PLACEHOLDER_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="50%" style="stop-color:#16213e"/>
      <stop offset="100%" style="stop-color:#0f3460"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#g)"/>
  <g transform="translate(200,200)" opacity="0.15">
    <rect x="-40" y="-50" width="80" height="100" rx="4" fill="none" stroke="white" stroke-width="3"/>
    <line x1="-25" y1="-25" x2="25" y2="-25" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <line x1="-25" y1="-12" x2="15" y2="-12" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <line x1="-25" y1="1" x2="20" y2="1" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <circle cx="0" cy="25" r="12" fill="none" stroke="white" stroke-width="2"/>
    <path d="M-5 25 L0 20 L5 25 L0 30Z" fill="white" opacity="0.5"/>
  </g>
</svg>`)}`;

export const PLACEHOLDER_IMAGE = PLACEHOLDER_SVG;

export default PLACEHOLDER_IMAGE;
