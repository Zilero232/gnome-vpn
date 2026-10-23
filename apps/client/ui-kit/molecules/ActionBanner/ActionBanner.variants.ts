import { cva } from 'class-variance-authority';

import s from './ActionBanner.module.scss';

export const actionBanner = cva(s.root, {
  variants: {
    tone: { accent: s.accent, peach: s.peach }
  },
  defaultVariants: { tone: 'accent' }
});
