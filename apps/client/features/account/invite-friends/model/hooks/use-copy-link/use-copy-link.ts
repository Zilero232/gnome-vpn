'use client';

import { useTranslations } from 'next-intl';

import { copyWithToast } from '@/ui-kit';

export const useCopyLink = () => {
  const t = useTranslations('referrals');

  return (url: string) => copyWithToast({ value: url, success: t('copied'), failure: t('copyFailed') });
};
