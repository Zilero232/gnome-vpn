'use client';

import type { ReactNode } from 'react';

import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ACCOUNT_TAB } from '@/shared/constants';

import type { AccessNoticeProps } from './AccessNotice.types';

import s from './AccessNotice.module.scss';

export const AccessNotice = ({ isWireguard }: AccessNoticeProps) => {
  const t = useTranslations('account.connect');

  const link = (chunks: ReactNode) => (
    <a className={s.link} href={`#${ACCOUNT_TAB.subscription}`}>
      {chunks}
    </a>
  );

  return (
    <p className={s.root}>
      <Info aria-hidden className={s.icon} size={16} />

      <span>{isWireguard ? t.rich('wireguardLocked', { link }) : t.rich('noAccess', { link })}</span>
    </p>
  );
};
