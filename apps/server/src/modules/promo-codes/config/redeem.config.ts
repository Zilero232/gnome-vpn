import type { PromoRedemption } from '@gnomevpn/schemas';

import type { RedemptionRefusal } from '../lib';

export const PROMO_REDEEM = {
  throttle: { ttl: 60_000, limit: 10 },
  unverifiedEmail: 'Confirm the email before redeeming a campaign or gift code'
} as const;

export const FRIEND_REDEMPTION: PromoRedemption = {
  kind: 'friend',
  percent: null,
  days: null,
  currentPeriodEnd: null
};

export const REDEMPTION_REFUSAL: Record<RedemptionRefusal, string> = {
  PROMO_CODE_ALREADY_USED: 'This account has already used this promo code',
  PROMO_CODE_EXPIRED: 'This promo code has expired',
  PROMO_CODE_USED_UP: 'This promo code has no uses left'
};
