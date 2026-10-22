import { cva } from 'class-variance-authority';

import s from './SelectableCard.module.scss';

export const selectableCard = cva(s.root, {
  variants: {
    isSelected: { true: s.selected, false: '' }
  },
  defaultVariants: { isSelected: false }
});
