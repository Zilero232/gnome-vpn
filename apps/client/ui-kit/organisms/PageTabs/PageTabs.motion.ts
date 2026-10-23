import type { Variants } from 'motion/react';

import { EASE_OUT } from '@/shared/lib';

export const TAB_PANEL_MOTION: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: EASE_OUT } }
};

export const PILL_MOTION = { type: 'spring', stiffness: 380, damping: 32 } as const;
