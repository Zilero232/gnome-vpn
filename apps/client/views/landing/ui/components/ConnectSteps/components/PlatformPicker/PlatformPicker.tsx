'use client';

import { LayoutGroup, motion } from 'motion/react';
import { useTranslations } from 'next-intl';

import { SPRING } from '@/shared/lib';

import type { PlatformPickerProps } from './PlatformPicker.types';

import s from './PlatformPicker.module.scss';

export const PlatformPicker = ({ platforms, value, onChange }: PlatformPickerProps) => {
  const t = useTranslations('landing.connect');
  const tIncy = useTranslations('incy.platforms');

  return (
    <LayoutGroup id='connect-platforms'>
      <div aria-label={t('platformsLabel')} className={s.root} role='group'>
        {platforms.map(({ id, icon: Icon }) => (
          <button key={id} aria-pressed={id === value} className={s.option} type='button' onClick={() => onChange(id)}>
            {id === value && <motion.span className={s.pill} layoutId='connect-pill' transition={SPRING.snappy} />}
            <Icon aria-hidden className={s.icon} size={17} strokeWidth={1.8} />
            <span className={s.label}>{tIncy(id)}</span>
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
};
