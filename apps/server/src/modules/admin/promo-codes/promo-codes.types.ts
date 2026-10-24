import type { adminCampaignQuerySchema, AdminCreateCampaign, adminGiftQuerySchema, AdminGiftState } from '@gnomevpn/schemas';
import type { z } from 'zod';

import type { Prisma } from '@/generated';

import type { CurrentAdminUser, GroupTotal } from '../shared/admin.types';
import type { CAMPAIGN_ROW_SELECT } from './promo-codes.config';

export type CampaignQuery = z.output<typeof adminCampaignQuerySchema>;

export type GiftQuery = z.output<typeof adminGiftQuerySchema>;

export type CampaignRow = Prisma.PromoCodeGetPayload<{ select: typeof CAMPAIGN_ROW_SELECT }>;

export type CampaignStateInput = {
  expiresAt: Date | null;
  maxUses: number | null;
  used: number;
  now: Date;
};

export type CampaignViewInput = {
  row: CampaignRow;
  sales: GroupTotal | undefined;
  now: Date;
};

export type GiftStateWhereInput = {
  state: AdminGiftState | undefined;
  now: Date;
};

export type CreateCampaignActionInput = {
  admin: CurrentAdminUser;
  input: AdminCreateCampaign;
};

export type StopCampaignActionInput = {
  admin: CurrentAdminUser;
  code: string;
};
