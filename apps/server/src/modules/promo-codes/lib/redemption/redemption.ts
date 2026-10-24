import { isAfter } from 'date-fns';
import { isEmpty, isNonNullish, isNullish } from 'remeda';

import type { Prisma } from '@/generated';

import type {
  AccountRedemptionsInput,
  PromoEffect,
  PromoEffectRow,
  RedemptionRefusal,
  RedemptionRefusalInput,
  RedemptionResult,
  RedemptionResultInput
} from './redemption.types';

export const redemptionRefusal = ({ promo, uses, isUsedByAccount, now }: RedemptionRefusalInput): RedemptionRefusal | null => {
  if (isUsedByAccount) {
    return 'PROMO_CODE_ALREADY_USED';
  }

  if (isNonNullish(promo.expiresAt) && !isAfter(promo.expiresAt, now)) {
    return 'PROMO_CODE_EXPIRED';
  }

  return isNonNullish(promo.maxUses) && uses >= promo.maxUses ? 'PROMO_CODE_USED_UP' : null;
};

export const promoEffect = ({ kind, percent, days }: PromoEffectRow): PromoEffect | null => {
  if (kind === 'discount') {
    return isNullish(percent) ? null : { kind, percent };
  }

  return isNullish(days) ? null : { kind, days };
};

export const redemptionResult = ({ effect, currentPeriodEnd }: RedemptionResultInput): RedemptionResult => {
  if (effect.kind === 'discount') {
    return { kind: effect.kind, percent: effect.percent, days: null, currentPeriodEnd: null };
  }

  return { kind: effect.kind, percent: null, days: effect.days, currentPeriodEnd: currentPeriodEnd?.toISOString() ?? null };
};

export const accountRedemptions = ({ userId, identities }: AccountRedemptionsInput): Prisma.PromoRedemptionWhereInput[] =>
  isEmpty(identities) ? [{ userId }] : [{ userId }, { identityHashes: { hasSome: identities } }];
