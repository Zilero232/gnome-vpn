'use client';

import { Info, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { hasIncyWithoutHwid } from '@/entities/vpn/device';

import type { DevicesNoticesProps } from './DevicesNotices.types';

import s from './DevicesNotices.module.scss';

export const DevicesNotices = ({ devices }: DevicesNoticesProps) => {
  const t = useTranslations('devices');

  return (
    <>
      {devices.some((device) => device.isOverLimit) && (
        <p className={s.warning} role='status'>
          <TriangleAlert aria-hidden className={s.warningIcon} size={16} />
          {t('overLimitWarning')}
        </p>
      )}

      {hasIncyWithoutHwid(devices) && (
        <p className={s.tip}>
          <Info aria-hidden className={s.warningIcon} size={16} />
          {t('hwidTip')}
        </p>
      )}
    </>
  );
};
