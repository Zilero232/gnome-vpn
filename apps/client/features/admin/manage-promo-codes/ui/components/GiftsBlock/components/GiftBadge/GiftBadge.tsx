'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/ui-kit';

import type { GiftBadgeProps } from './GiftBadge.types';

import { GIFT_STATE_TONE } from '../../../../../config';
import { giftState } from '../../../../../lib';

export const GiftBadge = ({ gift }: GiftBadgeProps) => {
  const t = useTranslations('admin.promo.gifts.states');
  const state = giftState(gift);

  return <Badge tone={GIFT_STATE_TONE[state]}>{t(state)}</Badge>;
};
