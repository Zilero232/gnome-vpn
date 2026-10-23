import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

import type { SelectProps } from './Select.types';

import s from './Select.module.scss';

export const Select = ({ className, children, ...props }: SelectProps) => (
  <span className={clsx(s.root, className)}>
    <select className={s.select} {...props}>
      {children}
    </select>

    <ChevronDown aria-hidden className={s.icon} size={16} />
  </span>
);
