import type { z } from 'zod';

import type { ADMIN_CAMPAIGN_STATES } from './promo-codes.constants';
import type {
  adminCampaignFormSchema,
  adminCampaignKindSchema,
  adminCampaignPageSchema,
  adminCampaignSchema,
  adminGiftPageSchema,
  adminGiftSchema
} from './promo-codes.schemas';

export type AdminCampaignKind = z.infer<typeof adminCampaignKindSchema>;

export type AdminCampaignState = (typeof ADMIN_CAMPAIGN_STATES)[number];

export type AdminCampaignFormValues = z.input<typeof adminCampaignFormSchema>;

export type AdminCreateCampaign = z.output<typeof adminCampaignFormSchema>;

export type AdminCampaign = z.infer<typeof adminCampaignSchema>;

export type AdminCampaignPage = z.infer<typeof adminCampaignPageSchema>;

export type AdminGift = z.infer<typeof adminGiftSchema>;

export type AdminGiftPage = z.infer<typeof adminGiftPageSchema>;
