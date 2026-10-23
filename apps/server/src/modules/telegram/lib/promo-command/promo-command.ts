import { isMatch } from 'date-fns';
import { isEmpty, isNonNullish, isNullish } from 'remeda';

import type { CampaignOptions, PromoCommand, ReadOptionInput } from './promo-command.types';

import { PROMO_COMMAND } from './promo-command.constants';

const readOption = ({ token, options }: ReadOptionInput): CampaignOptions | null => {
  const percent = PROMO_COMMAND.percent.exec(token);
  const days = PROMO_COMMAND.days.exec(token);
  const uses = PROMO_COMMAND.uses.exec(token);
  const until = PROMO_COMMAND.until.exec(token);

  if ((percent ?? days) && isNonNullish(options.effect)) {
    return null;
  }

  if (percent) {
    return { ...options, effect: { kind: 'discount', percent: Number(percent[1]) } };
  }

  if (days) {
    return { ...options, effect: { kind: 'days', days: Number(days[1]) } };
  }

  if (uses) {
    return { ...options, maxUses: Number(uses[1]) };
  }

  if (until) {
    return {
      ...options,
      expiresAt: isMatch(until[1], PROMO_COMMAND.dateFormat) ? new Date(`${until[1]}${PROMO_COMMAND.dayEnd}`) : new Date(Number.NaN)
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
    return rest.length === 1 ? { action: 'stop', code: rest[0] } : { action: 'unknown' };
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
