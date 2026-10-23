import type { ApiErrorCode, PromoRedemption } from '@gnomevpn/schemas';

import type { PromoCodeKind } from '../../../../../generated';

export type RedemptionRefusal = Extract<ApiErrorCode, 'PROMO_CODE_ALREADY_USED' | 'PROMO_CODE_EXPIRED' | 'PROMO_CODE_USED_UP'>;

export type RedemptionLimits = {
  expiresAt: Date | null;
  maxUses: number | null;
};

export type RedemptionRefusalInput = {
  promo: RedemptionLimits;
  uses: number;
  isUsedByAccount: boolean;
  now: Date;
};

export type PromoEffectRow = {
  kind: PromoCodeKind;
  percent: number | null;
  days: number | null;
};

export type PromoEffect = { kind: 'days' | 'gift'; days: number } | { kind: 'discount'; percent: number };

export type RedemptionResultInput = {
  effect: PromoEffect;
  currentPeriodEnd: Date | null;
};

export type RedemptionResult = PromoRedemption;
