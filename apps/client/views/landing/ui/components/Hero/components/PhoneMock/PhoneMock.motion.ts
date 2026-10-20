import type { Variants } from 'motion/react';

import { EASE_OUT, SPRING } from '@/shared/lib';

export const PHONE: Variants = {
  hidden: { rotateY: -24, rotateX: 12, y: 24, opacity: 0 },
  visible: { rotateY: -12, rotateX: 6, y: 0, opacity: 1, transition: { ...SPRING.snappy, delay: 0.2 } },
  flat: { rotateY: 0, rotateX: 0, transition: SPRING.snappy }
};

export const KNOB: Variants = {
  hidden: { x: 0 },
  visible: { x: 18, transition: { ...SPRING.snappy, delay: 0.9 } }
};

export const FADE_IN_LATE: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT, delay: 1 } }
};
