import { match } from 'ts-pattern';

import type { Prisma } from '@/generated';

import type { GiftStateWhereInput } from './gift-filter.types';

export const giftStateWhere = ({ state, now }: GiftStateWhereInput): Prisma.PromoCodeWhereInput => {
  const isLive = { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] };

  return match(state)
    .with('revoked', () => ({ expiresAt: { lte: now } }))
    .with('redeemed', () => ({ AND: [isLive, { redemptions: { some: {} } }] }))
    .with('waiting', () => ({ AND: [isLive, { redemptions: { none: {} } }] }))
    .with(undefined, () => ({}))
    .exhaustive();
};
