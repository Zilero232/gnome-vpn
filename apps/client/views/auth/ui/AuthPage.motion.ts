import type { Variants } from 'motion/react';

import { EASE_OUT } from '@/shared/lib';

export const FORM_SWAP: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE_OUT } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } }
};
