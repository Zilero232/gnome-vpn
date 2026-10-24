import { isAfter, isMatch } from 'date-fns';
import { isEmpty, isNonNullish, isNullish, isTruthy } from 'remeda';

import type {
  CampaignCreatedTextInput,
  CampaignLineInput,
  CampaignListTextInput,
  CampaignOptions,
  CampaignProblemText,
  CampaignProblemTextInput,
  CampaignTextInput,
  PromoCommand,
  ReadOptionInput
} from './owner.types';

import { BOT_TEXT } from '../config';
import { dayCount, fillText, formatDate, html } from '../shared/text';
import { CAMPAIGN_TEXT, PROMO_COMMAND } from './owner.config';

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

export const campaignEffectText = ({ campaign, locale }: CampaignTextInput): string => {
  const text = BOT_TEXT[locale];

  return isNonNullish(campaign.percent)
    ? fillText({ text: text.promoEffectDiscount, fill: { percent: String(campaign.percent) } })
    : fillText({ text: text.promoEffectDays, fill: { days: dayCount({ days: campaign.days ?? 0, locale }) } });
};

const untilText = ({ campaign, locale }: CampaignTextInput): string | null =>
  isNullish(campaign.expiresAt)
    ? null
    : fillText({ text: BOT_TEXT[locale].promoUntil, fill: { date: formatDate({ iso: campaign.expiresAt.toISOString(), locale }) } });

export const campaignCreatedText = ({ campaign, link, locale }: CampaignCreatedTextInput): string => {
  const text = BOT_TEXT[locale];
  const limit = isNullish(campaign.maxUses) ? null : fillText({ text: text.promoUsedOf, fill: { used: '0', max: String(campaign.maxUses) } });
  const effect = [campaignEffectText({ campaign, locale }), limit, untilText({ campaign, locale })]
    .filter(isTruthy)
    .join(CAMPAIGN_TEXT.detailSeparator);

  return html.paragraphs([
    fillText({ text: text.promoCreated, fill: { code: campaign.code, effect } }),
    fillText({ text: text.promoCreatedLink, fill: { link } })
  ]);
};

export const campaignLine = ({ campaign, locale, now }: CampaignLineInput): string => {
  const text = BOT_TEXT[locale];
  const used = isNullish(campaign.maxUses)
    ? fillText({ text: text.promoUsed, fill: { used: String(campaign.used) } })
    : fillText({ text: text.promoUsedOf, fill: { used: String(campaign.used), max: String(campaign.maxUses) } });

  const isStopped = isNonNullish(campaign.expiresAt) && !isAfter(campaign.expiresAt, now);

  return [
    html.code(campaign.code),
    campaignEffectText({ campaign, locale }),
    used,
    isStopped ? text.promoStoppedMark : untilText({ campaign, locale })
  ]
    .filter(isTruthy)
    .join(CAMPAIGN_TEXT.lineSeparator);
};

export const campaignListText = ({ campaigns, locale, now }: CampaignListTextInput): string => {
  const text = BOT_TEXT[locale];
  const lines = isEmpty(campaigns) ? text.promoListEmpty : campaigns.map((campaign) => campaignLine({ campaign, locale, now })).join('\n');

  return html.paragraphs([text.promoUsage, [text.promoListTitle, lines].join('\n')]);
};

export const campaignProblemText = ({ problem, locale }: CampaignProblemTextInput): string => {
  const { key, min, max }: CampaignProblemText = CAMPAIGN_TEXT.problems[problem];

  return fillText({ text: BOT_TEXT[locale][key], fill: { min: String(min ?? ''), max: String(max ?? '') } });
};
