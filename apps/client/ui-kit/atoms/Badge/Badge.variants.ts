import { cva } from 'class-variance-authority';

import s from './Badge.module.scss';

export const badge = cva(s.root, {
  variants: {
    tone: { accent: s.accent, danger: s.danger, muted: s.muted, warning: s.warning }
  },
  defaultVariants: { tone: 'accent' }
});
