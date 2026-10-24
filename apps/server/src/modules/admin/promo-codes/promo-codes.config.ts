import type { Prisma } from '@/generated';

export const CAMPAIGN_ROW_SELECT = {
  id: true,
  code: true,
  kind: true,
  percent: true,
  days: true,
  maxUses: true,
  expiresAt: true,
  createdAt: true,
  _count: { select: { redemptions: true } }
} as const satisfies Prisma.PromoCodeSelect;

export const CAMPAIGN_EXPIRY = {
  dayEnd: 'T23:59:59+03:00'
} as const;
