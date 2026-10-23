export const PROMO_CODE = {
  minLength: 4,
  maxLength: 24,
  inputMaxLength: 64,
  maxUses: 1_000_000
} as const;

export const GIFT_CODE = {
  length: 12,
  groupSize: 4,
  separator: '-'
} as const;

export const GIFT_PERIOD = {
  daysPerYear: 365,
  monthsPerYear: 12
} as const;

export const PROMO_DISCOUNT = {
  minPercent: 1,
  maxPercent: 90,
  minPriceRub: 1
} as const;

export const PROMO_DAYS = {
  min: 1,
  max: 365
} as const;

export const PROMO_ORIGINS = ['friend', 'campaign', 'gift'] as const;

export const CAMPAIGN_KINDS = ['discount', 'days'] as const;

export const PROMO_REDEMPTION_KINDS = ['friend', 'discount', 'days', 'gift'] as const;
