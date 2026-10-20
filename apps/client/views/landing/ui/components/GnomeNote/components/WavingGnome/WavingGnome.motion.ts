import type { Variants } from 'motion/react';

export const WAVE: Variants = {
  hidden: { rotate: 0 },
  visible: { rotate: [0, -22, 4, -18, 0], transition: { duration: 1.6, ease: 'easeInOut', delay: 0.3 } }
};
