import type { Variants } from 'motion/react';

import { SPRING } from '@/shared/lib';

export const ICON: Variants = {
  initial: { scale: 0.4, rotate: -45, opacity: 0 },
  animate: { scale: 1, rotate: 0, opacity: 1, transition: SPRING.snappy },
  exit: { scale: 0.4, opacity: 0, transition: { duration: 0.12 } }
};

export const SPARKS = [
  { x: -11, y: -10 },
  { x: 12, y: -9 },
  { x: 0, y: 13 }
] as const;

export const SPARK: Variants = {
  initial: { x: 0, y: 0, scale: 0.6, opacity: 1 },
  animate: (spark: { x: number; y: number }) => ({ x: spark.x, y: spark.y, scale: 0, opacity: 0, transition: { duration: 0.5, ease: 'easeOut' } })
};
