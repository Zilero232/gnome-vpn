import type { AdminCampaignFormValues, AdminCampaignKind } from '@gnomevpn/schemas';

import { PROMO_DAYS, PROMO_DISCOUNT } from '@gnomevpn/schemas';

export const CAMPAIGN_FORM = {
  defaults: { code: '', kind: 'discount', value: 10, maxUses: null, until: '' }
} as const satisfies { defaults: AdminCampaignFormValues };

export const CAMPAIGN_VALUE_RANGE: Record<AdminCampaignKind, { min: number; max: number }> = {
  discount: { min: PROMO_DISCOUNT.minPercent, max: PROMO_DISCOUNT.maxPercent },
  days: { min: PROMO_DAYS.min, max: PROMO_DAYS.max }
};

export const CAMPAIGN_CHART = {
  limit: 8
} as const;
