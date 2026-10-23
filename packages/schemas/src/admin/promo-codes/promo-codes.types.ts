import type { z } from 'zod';

import type { ADMIN_CAMPAIGN_STATES, ADMIN_GIFT_STATES } from './promo-codes.constants';
import type {
  adminCampaignFormSchema,
  adminCampaignKindSchema,
  adminCampaignPageSchema,
  adminCampaignQuerySchema,
  adminCampaignSchema,
  adminGiftPageSchema,
  adminGiftQuerySchema,
  adminGiftSchema
} from './promo-codes.schemas';

export type AdminCampaignKind = z.infer<typeof adminCampaignKindSchema>;

export type AdminCampaignState = (typeof ADMIN_CAMPAIGN_STATES)[number];

export type AdminGiftState = (typeof ADMIN_GIFT_STATES)[number];

export type AdminCampaignQuery = z.input<typeof adminCampaignQuerySchema>;

export type AdminGiftQuery = z.input<typeof adminGiftQuerySchema>;

export type AdminCampaignFormValues = z.input<typeof adminCampaignFormSchema>;

export type AdminCreateCampaign = z.output<typeof adminCampaignFormSchema>;

export type AdminCampaign = z.infer<typeof adminCampaignSchema>;

export type AdminCampaignPage = z.infer<typeof adminCampaignPageSchema>;

export type AdminGift = z.infer<typeof adminGiftSchema>;

export type AdminGiftPage = z.infer<typeof adminGiftPageSchema>;
