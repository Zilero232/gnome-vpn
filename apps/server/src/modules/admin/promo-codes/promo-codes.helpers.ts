import type { AdminCampaign, AdminCampaignState, CampaignKind } from '@gnomevpn/schemas';

import { CAMPAIGN_KINDS } from '@gnomevpn/schemas';
import { isAfter } from 'date-fns';
import { isIncludedIn, isNonNullish, isNullish } from 'remeda';
import { match } from 'ts-pattern';

import type { Prisma } from '@/generated';

import type { CampaignStateInput, CampaignViewInput, GiftStateWhereInput } from './promo-codes.types';

import { isoOrNull } from '../shared/listing.helpers';
import { CAMPAIGN_EXPIRY } from './promo-codes.config';

export const campaignState = ({ expiresAt, maxUses, used, now }: CampaignStateInput): AdminCampaignState => {
  if (isNonNullish(expiresAt) && !isAfter(expiresAt, now)) {
    return 'expired';
  }

  return isNonNullish(maxUses) && used >= maxUses ? 'usedUp' : 'active';
};

export const campaignExpiry = (lastDay: string | null): Date | null => (isNullish(lastDay) ? null : new Date(`${lastDay}${CAMPAIGN_EXPIRY.dayEnd}`));

export const giftStateWhere = ({ state, now }: GiftStateWhereInput): Prisma.PromoCodeWhereInput => {
  const isLive = { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] };

  return match(state)
    .with('revoked', () => ({ expiresAt: { lte: now } }))
    .with('redeemed', () => ({ AND: [isLive, { redemptions: { some: {} } }] }))
    .with('waiting', () => ({ AND: [isLive, { redemptions: { none: {} } }] }))
    .with(undefined, () => ({}))
    .exhaustive();
};

const isCampaignKind = (kind: string): kind is CampaignKind => isIncludedIn(kind, CAMPAIGN_KINDS);

export const campaignView = ({ row, sales, now }: CampaignViewInput): AdminCampaign | null => {
  const { kind } = row;

  if (!isCampaignKind(kind)) {
    return null;
  }

  return {
    id: row.id,
    code: row.code,
    kind,
    percent: row.percent,
    days: row.days,
    maxUses: row.maxUses,
    expiresAt: isoOrNull(row.expiresAt),
    createdAt: row.createdAt.toISOString(),
    state: campaignState({ expiresAt: row.expiresAt, maxUses: row.maxUses, used: row._count.redemptions, now }),
    used: row._count.redemptions,
    payments: sales?.count ?? 0,
    revenue: sales?.amount ?? 0
  };
};
