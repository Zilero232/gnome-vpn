import type { ApiErrorCode } from '@gnomevpn/schemas';

export const FINAL_REFUSALS: readonly ApiErrorCode[] = [
  'REFERRAL_CODE_INVALID',
  'REFERRAL_SELF',
  'REFERRAL_UNAVAILABLE',
  'PROMO_CODE_INVALID',
  'PROMO_CODE_EXPIRED',
  'PROMO_CODE_USED_UP',
  'PROMO_CODE_ALREADY_USED',
  'VALIDATION_FAILED'
];
