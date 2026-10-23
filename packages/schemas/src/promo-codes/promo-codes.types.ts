import type { z } from 'zod';

import type { CAMPAIGN_KINDS, PROMO_ORIGINS } from './promo-codes.constants';
import type {
  giftListSchema,
  giftSchema,
  pendingDiscountSchema,
  promoDiscountSchema,
  promoRedemptionSchema,
  redeemPromoCodeSchema
} from './promo-codes.schemas';

export type PromoCodeOrigin = (typeof PROMO_ORIGINS)[number];

export type CampaignKind = (typeof CAMPAIGN_KINDS)[number];

export type DiscountedPriceInput = {
  priceRub: number;
  percent: number;
};

export type RedeemPromoCodeInput = z.infer<typeof redeemPromoCodeSchema>;

export type PromoRedemption = z.infer<typeof promoRedemptionSchema>;

export type PromoRedemptionKind = PromoRedemption['kind'];

export type PromoDiscount = z.infer<typeof promoDiscountSchema>;

export type PendingDiscount = z.infer<typeof pendingDiscountSchema>;

export type Gift = z.infer<typeof giftSchema>;

export type GiftList = z.infer<typeof giftListSchema>;
