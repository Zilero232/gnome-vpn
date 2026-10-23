import { isPromoCode, normalisePromoCode, PROMO_CODE, PROMO_DAYS, PROMO_DISCOUNT, promoCodeOrigin } from '@gnomevpn/schemas';
import { isAfter, isValid } from 'date-fns';
import { isNullish } from 'remeda';

import type { CampaignDraft, CampaignEffect, CampaignProblem, CampaignProblemInput, CreateCampaignInput, WithinInput } from './campaign.types';

const isWholeWithin = ({ value, min, max }: WithinInput): boolean => Number.isInteger(value) && value >= min && value <= max;

const effectProblem = (effect: CampaignEffect): CampaignProblem | null => {
  if (effect.kind === 'discount') {
    return isWholeWithin({ value: effect.percent, min: PROMO_DISCOUNT.minPercent, max: PROMO_DISCOUNT.maxPercent }) ? null : 'percentRange';
  }

  return isWholeWithin({ value: effect.days, min: PROMO_DAYS.min, max: PROMO_DAYS.max }) ? null : 'daysRange';
};

export const campaignProblem = ({ input, now }: CampaignProblemInput): CampaignProblem | null => {
  if (!isPromoCode(input.code)) {
    return 'codeFormat';
  }

  const origin = promoCodeOrigin(input.code);

  if (origin === 'friend') {
    return 'codeLikeFriend';
  }

  if (origin === 'gift') {
    return 'codeLikeGift';
  }

  const problem = effectProblem(input);

  if (problem) {
    return problem;
  }

  if (!isNullish(input.maxUses) && !isWholeWithin({ value: input.maxUses, min: 1, max: PROMO_CODE.maxUses })) {
    return 'maxUsesRange';
  }

  if (isNullish(input.expiresAt)) {
    return null;
  }

  if (!isValid(input.expiresAt)) {
    return 'expiryInvalid';
  }

  return isAfter(input.expiresAt, now) ? null : 'expiryPast';
};

export const campaignDraft = (input: CreateCampaignInput): CampaignDraft => ({
  code: normalisePromoCode(input.code),
  kind: input.kind,
  percent: input.kind === 'discount' ? input.percent : null,
  days: input.kind === 'days' ? input.days : null,
  maxUses: input.maxUses ?? null,
  expiresAt: input.expiresAt ?? null
});
