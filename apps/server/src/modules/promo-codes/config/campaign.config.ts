import { GIFT_CODE, PROMO_CODE, PROMO_DAYS, PROMO_DISCOUNT, SHORT_CODE } from '@gnomevpn/schemas';

import type { CampaignProblem } from '../lib';

export const CAMPAIGN_PROBLEM: Record<CampaignProblem, string> = {
  codeFormat: `A promo code is ${PROMO_CODE.minLength}–${PROMO_CODE.maxLength} latin letters and digits`,
  codeLikeFriend: `This code is shaped like a friend code (${SHORT_CODE.length} of ${SHORT_CODE.alphabet}) — change its length or use 0, O, 1, I or L`,
  codeLikeGift: `This code is shaped like a gift code (${GIFT_CODE.length} of ${SHORT_CODE.alphabet}) — change its length or use 0, O, 1, I or L`,
  percentRange: `A discount is a whole percent from ${PROMO_DISCOUNT.minPercent} to ${PROMO_DISCOUNT.maxPercent}`,
  daysRange: `Bonus days are a whole number from ${PROMO_DAYS.min} to ${PROMO_DAYS.max}`,
  maxUsesRange: `Max uses is a whole number from 1 to ${PROMO_CODE.maxUses}, or empty for no limit`,
  expiryInvalid: 'The expiry is not a valid date',
  expiryPast: 'The expiry must be in the future'
};

export const CAMPAIGN_LIST = {
  limit: 10
} as const;

export const CAMPAIGN_SELECT = {
  id: true,
  code: true,
  kind: true,
  percent: true,
  days: true,
  maxUses: true,
  expiresAt: true,
  createdAt: true
} as const;
