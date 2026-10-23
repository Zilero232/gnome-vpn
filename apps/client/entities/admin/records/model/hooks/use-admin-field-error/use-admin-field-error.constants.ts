import { ADMIN_USER, PROMO_CODE, PROMO_DAYS, PROMO_DISCOUNT } from '@gnomevpn/schemas';

export const ADMIN_LIMITS = {
  codeMin: PROMO_CODE.minLength,
  codeMax: PROMO_CODE.maxLength,
  percentMin: PROMO_DISCOUNT.minPercent,
  percentMax: PROMO_DISCOUNT.maxPercent,
  daysMin: PROMO_DAYS.min,
  daysMax: PROMO_DAYS.max,
  extendMin: ADMIN_USER.extendMinDays,
  extendMax: ADMIN_USER.extendMaxDays,
  messageMax: ADMIN_USER.messageMaxLength
} as const;
