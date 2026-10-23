'use client';

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

import type { CheckboxProps } from './Checkbox.types';

import s from './Checkbox.module.scss';

export const Checkbox = ({ className, ...props }: CheckboxProps) => (
  <BaseCheckbox.Root className={clsx(s.root, className)} {...props}>
    <BaseCheckbox.Indicator className={s.indicator}>
      <Check aria-hidden size={13} strokeWidth={3} />
    </BaseCheckbox.Indicator>
  </BaseCheckbox.Root>
);
