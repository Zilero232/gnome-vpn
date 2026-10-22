'use client';

import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { SubmitButton } from '@/ui-kit';

import type { SignOutButtonProps } from './SignOutButton.types';

import { useSignOut } from '../../model/hooks';

import s from './SignOutButton.module.scss';

export const SignOutButton = ({ variant = 'quiet' }: SignOutButtonProps) => {
  const t = useTranslations('account');
  const signOut = useSignOut();

  if (variant === 'block') {
    return (
      <SubmitButton isPending={signOut.isPending} size='md' type='button' variant='ghost' onClick={() => signOut.mutate()}>
        <LogOut aria-hidden size={16} />
        {t('signOut')}
      </SubmitButton>
    );
  }

  return (
    <button aria-busy={signOut.isPending} className={s.quiet} disabled={signOut.isPending} type='button' onClick={() => signOut.mutate()}>
      <LogOut aria-hidden size={14} />
      {t('signOut')}
    </button>
  );
};
