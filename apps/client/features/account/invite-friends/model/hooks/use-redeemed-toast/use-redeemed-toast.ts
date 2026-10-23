'use client';

import type { PromoRedemption } from '@gnomevpn/schemas';

import { useTranslations } from 'next-intl';

import { celebrate } from '@/ui-kit';

import { redeemedMessage } from '../../../lib';

export const useRedeemedToast = () => {
  const t = useTranslations('referrals');

  return (result: PromoRedemption) => {
    const { key, values } = redeemedMessage(result);

    celebrate(t(key, values));
  };
};
