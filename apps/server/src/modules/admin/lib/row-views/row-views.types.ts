import type { Prisma } from '@/generated';
import type { CAMPAIGN_ROW_SELECT, GIFT_ROW_SELECT, PAYMENT_ROW_SELECT, USER_ROW_SELECT } from '@/modules/admin/config';
import type { StatusNodeRow } from '@/modules/status';

import type { GroupTotal } from '../group-total';

export type PaymentRow = Prisma.PaymentGetPayload<{ select: typeof PAYMENT_ROW_SELECT }>;

export type UserRow = Prisma.UserGetPayload<{ select: typeof USER_ROW_SELECT }>;

export type GiftRow = Prisma.PromoCodeGetPayload<{ select: typeof GIFT_ROW_SELECT }>;

export type CampaignRow = Prisma.PromoCodeGetPayload<{ select: typeof CAMPAIGN_ROW_SELECT }>;

export type GiftViewInput = {
  row: GiftRow;
  now: Date;
};

export type CampaignViewInput = {
  row: CampaignRow;
  sales: GroupTotal | undefined;
  now: Date;
};

export type AdminNodeRow = StatusNodeRow & {
  id: string;
  country: string;
  city: string | null;
  host: string;
  port: number;
  isAvailable: boolean;
  displayOrder: number;
  createdAt: Date;
};

export type NodeViewInput = {
  node: AdminNodeRow;
  now: Date;
};
