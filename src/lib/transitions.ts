import type { TransitionDirectionalAnimations } from 'astro';

// Page change: the old sheet slides away, the new one lands with a slight tilt and a springy settle.
// Keyframes live in global.css (tgl-*). Astro skips these when the reader prefers reduced motion.
const inEase = 'cubic-bezier(.3, 1.4, .5, 1)';

export const paper: TransitionDirectionalAnimations = {
  forwards: {
    old: { name: 'tgl-out', duration: '160ms', easing: 'ease-in', fillMode: 'both' },
    new: { name: 'tgl-in', duration: '420ms', easing: inEase, fillMode: 'both' },
  },
  backwards: {
    old: { name: 'tgl-out-back', duration: '160ms', easing: 'ease-in', fillMode: 'both' },
    new: { name: 'tgl-in-back', duration: '420ms', easing: inEase, fillMode: 'both' },
  },
};
