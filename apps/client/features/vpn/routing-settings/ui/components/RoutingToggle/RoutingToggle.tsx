'use client';

import { useId } from 'react';

import { Switch } from '@/ui-kit';

import type { RoutingToggleProps } from './RoutingToggle.types';

import s from './RoutingToggle.module.scss';

export const RoutingToggle = ({ label, hint, icon: Icon, checked, onCheckedChange }: RoutingToggleProps) => {
  const id = useId();

  const switchId = `${id}-switch`;
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;

  return (
    <label className={s.root} htmlFor={switchId}>
      <span aria-hidden className={s.icon}>
        <Icon />
      </span>

      <span className={s.text}>
        <span className={s.label} id={labelId}>
          {label}
        </span>

        <span className={s.hint} id={hintId}>
          {hint}
        </span>
      </span>

      <Switch aria-describedby={hintId} aria-labelledby={labelId} checked={checked} id={switchId} onCheckedChange={onCheckedChange} />
    </label>
  );
};
