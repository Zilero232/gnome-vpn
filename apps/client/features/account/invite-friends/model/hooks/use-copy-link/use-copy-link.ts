'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { writeClipboard } from '@/shared/lib';

export const useCopyLink = () => {
  const t = useTranslations('referrals');

  return async (url: string) => {
    try {
      await writeClipboard(url);
    } catch {
      toast.error(t('copyFailed'));

      return;
    }

    toast.success(t('copied'));
  };
};
