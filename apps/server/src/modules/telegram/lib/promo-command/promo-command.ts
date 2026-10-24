import { isMatch } from 'date-fns';
import { isEmpty, isNonNullish, isNullish } from 'remeda';

import type { CampaignOptions, PromoCommand, ReadOptionInput } from './promo-command.types';

import { PROMO_COMMAND } from './promo-command.constants';

const readOption = ({ token, options }: ReadOptionInput): CampaignOptions | null => {
  const percent = PROMO_COMMAND.percent.exec(token)?.[1];
  const days = PROMO_COMMAND.days.exec(token)?.[1];
  const uses = PROMO_COMMAND.uses.exec(token)?.[1];
  const until = PROMO_COMMAND.until.exec(token)?.[1];

  if ((percent ?? days) && isNonNullish(options.effect)) {
    return null;
  }

  if (percent) {
    return { ...options, effect: { kind: 'discount', percent: Number(percent) } };
  }

  if (days) {
    return { ...options, effect: { kind: 'days', days: Number(days) } };
  }

  if (uses) {
    return { ...options, maxUses: Number(uses) };
  }

  if (until) {
    return {
      ...options,
      expiresAt: isMatch(until, PROMO_COMMAND.dateFormat) ? new Date(`${until}${PROMO_COMMAND.dayEnd}`) : new Date(Number.NaN)
    };
  }

  return null;
};

export const parsePromoCommand = (raw: string): PromoCommand => {
  const [first, ...rest] = raw
    .trim()
    .split(PROMO_COMMAND.separator)
    .filter((token) => !isEmpty(token));

  if (isNullish(first)) {
    return { action: 'list' };
  }

  if (first.toLowerCase() === PROMO_COMMAND.stop) {
    const [code, ...extra] = rest;

    return isNonNullish(code) && isEmpty(extra) ? { action: 'stop', code } : { action: 'unknown' };
  }

  let options: CampaignOptions | null = { effect: null, maxUses: null, expiresAt: null };

  for (const token of rest) {
    options = readOption({ token, options });

    if (isNullish(options)) {
      return { action: 'unknown' };
    }
  }

  if (isNullish(options.effect)) {
    return { action: 'unknown' };
  }

  return { action: 'create', input: { code: first, ...options.effect, maxUses: options.maxUses, expiresAt: options.expiresAt } };
};
