'use client';

import { clsx } from 'clsx';
import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/ui-kit';

import type { SignOutButtonProps } from './SignOutButton.types';

import { useSignOut } from '../../model/hooks';

import s from './SignOutButton.module.scss';

export const SignOutButton = ({ variant = 'quiet', className }: SignOutButtonProps) => {
  const t = useTranslations('account');
  const signOut = useSignOut();

  if (variant === 'block') {
    return (
      <Button aria-busy={signOut.isPending} className={className} disabled={signOut.isPending} variant='ghost' onClick={() => signOut.mutate()}>
        <LogOut aria-hidden size={16} />
        {t('signOut')}
      </Button>
    );
  }

  return (
    <button
      aria-busy={signOut.isPending}
      className={clsx(s.quiet, className)}
      disabled={signOut.isPending}
      type='button'
      onClick={() => signOut.mutate()}
    >
      <LogOut aria-hidden size={14} />
      {t('signOut')}
    </button>
  );
};
