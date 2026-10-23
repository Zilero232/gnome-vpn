import { giftDays } from '@gnomevpn/schemas';
import { first, isNonNullish, isNullish } from 'remeda';

import type { GiftDraft, GiftToIssueInput, GiftView, GiftViewInput } from './gift.types';

import { GIFT } from '../../config';

export const giftToIssue = ({ payment, existing }: GiftToIssueInput): GiftDraft | null => {
  if (payment.kind !== 'gift' || isNonNullish(existing)) {
    return null;
  }

  return {
    kind: 'gift',
    plan: payment.plan,
    days: giftDays(payment.plan),
    maxUses: GIFT.maxUses,
    buyerId: payment.userId,
    paymentId: payment.id
  };
};

export const giftView = ({ row, link }: GiftViewInput): GiftView | null => {
  if (isNullish(row.plan) || isNullish(row.days)) {
    return null;
  }

  return {
    code: row.code,
    link,
    plan: row.plan,
    days: row.days,
    purchasedAt: row.createdAt.toISOString(),
    redeemedAt: first(row.redemptions)?.createdAt.toISOString() ?? null,
    revokedAt: row.expiresAt?.toISOString() ?? null
  };
};
