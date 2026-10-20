import type { Transition, Variants } from 'motion/react';

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const SPRING = {
  soft: { stiffness: 120, damping: 20, mass: 0.6 },
  tilt: { stiffness: 260, damping: 22 },
  snappy: { type: 'spring', stiffness: 420, damping: 32 } satisfies Transition
} as const;

export const REVEAL: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } }
};

export const STAGGER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
};

export const IN_VIEW = { once: true, amount: 0.3 } as const;
