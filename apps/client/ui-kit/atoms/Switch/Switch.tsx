'use client';

import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { clsx } from 'clsx';

import type { SwitchProps } from './Switch.types';

import s from './Switch.module.scss';

export const Switch = ({ className, ...props }: SwitchProps) => (
  <BaseSwitch.Root className={clsx(s.root, className)} {...props}>
    <BaseSwitch.Thumb className={s.thumb} />
  </BaseSwitch.Root>
);
