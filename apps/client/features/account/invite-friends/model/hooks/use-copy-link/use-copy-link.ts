'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export const useCopyLink = () => {
  const t = useTranslations('referrals');

  return async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      toast.error(t('copyFailed'));

      return;
    }

    toast.success(t('copied'));
  };
};
