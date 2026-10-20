'use client';

import type { ReactNode } from 'react';

import { useTranslations } from 'next-intl';

import { useCurrentUser } from '@/entities/auth/user';
import { useHydrated } from '@/shared/lib';

import { AccountSkeleton } from './components';

import s from './AccountShell.module.scss';

export const AccountShell = ({ children }: { children: ReactNode }) => {
  const t = useTranslations('common');
  const { isLoading, isAuthenticated } = useCurrentUser();
  const isHydrated = useHydrated();

  const isPending = !isHydrated || isLoading || !isAuthenticated;

  return (
    <div className={s.frame}>
      <div aria-hidden={isPending} className={s.root} inert={isPending}>
        {children}
      </div>

      {isPending && <AccountSkeleton className={s.overlay} label={t('loading')} />}
    </div>
  );
};
