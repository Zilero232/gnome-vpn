import { isAfter } from 'date-fns';
import { isEmpty, isNonNullish, isNullish, isTruthy } from 'remeda';

import { BOT_TEXT, NEW_LINE } from '@/modules/telegram/config';

import type {
  CampaignCreatedTextInput,
  CampaignLineInput,
  CampaignListTextInput,
  CampaignProblemTextInput,
  CampaignTextInput
} from './promo-text.types';

import { dayCount } from '../day-count';
import { fillText } from '../fill-text';
import { formatDate } from '../format-date';
import { html } from '../html';
import { CAMPAIGN_DETAIL_SEPARATOR, CAMPAIGN_LINE_SEPARATOR, CAMPAIGN_PROBLEM_TEXT } from './promo-text.constants';

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
  const effect = [campaignEffectText({ campaign, locale }), limit, untilText({ campaign, locale })].filter(isTruthy).join(CAMPAIGN_DETAIL_SEPARATOR);

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
    .join(CAMPAIGN_LINE_SEPARATOR);
};

export const campaignListText = ({ campaigns, locale, now }: CampaignListTextInput): string => {
  const text = BOT_TEXT[locale];
  const lines = isEmpty(campaigns) ? text.promoListEmpty : campaigns.map((campaign) => campaignLine({ campaign, locale, now })).join(NEW_LINE);

  return html.paragraphs([text.promoUsage, [text.promoListTitle, lines].join(NEW_LINE)]);
};

export const campaignProblemText = ({ problem, locale }: CampaignProblemTextInput): string => {
  const { key, min, max } = CAMPAIGN_PROBLEM_TEXT[problem];

  return fillText({ text: BOT_TEXT[locale][key], fill: { min: String(min ?? ''), max: String(max ?? '') } });
};
