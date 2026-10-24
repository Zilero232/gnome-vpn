import { countryName, PLANS } from '@gnomevpn/schemas';
import { format, formatDistanceStrict } from 'date-fns';
import { isNonNullish, isNullish, isTruthy, mapValues } from 'remeda';

import type { BotLocale } from '@/modules/telegram/telegram.types';

import { countryFlag, errorCodeOf, fillTokens, pluralize } from '@/common/lib';
import { BOT_TEXT } from '@/modules/telegram/config';

import type {
  DayCountInput,
  FillTextInput,
  FormatAgoInput,
  FormatAmountInput,
  FormatDateInput,
  NodeLabelInput,
  PlanLabelInput,
  RefusalTextInput
} from './text.types';

import { html } from './html';
import { AMOUNT_FORMAT, DATE_FORMAT, LABEL } from './text.constants';

export const fillLabel = ({ text, fill }: FillTextInput): string => fillTokens({ text, fill });

export const fillText = ({ text, fill }: FillTextInput): string => fillTokens({ text, fill: mapValues(fill, (value) => html.escape(value)) });

export const formatDate = ({ iso, locale }: FormatDateInput): string => {
  if (isNullish(iso)) {
    return '';
  }

  return format(new Date(iso), DATE_FORMAT.pattern, { locale: DATE_FORMAT.locales[locale] });
};

export const formatAgo = ({ date, now, locale }: FormatAgoInput): string =>
  formatDistanceStrict(date, now, { addSuffix: true, locale: DATE_FORMAT.locales[locale] });

export const formatAmount = ({ amount, locale }: FormatAmountInput): string => new Intl.NumberFormat(locale, AMOUNT_FORMAT).format(amount);

export const dayCount = ({ days, locale }: DayCountInput): string => {
  const text = BOT_TEXT[locale];

  return `${days} ${pluralize({ count: days, forms: { one: text.dayOne, few: text.dayFew, many: text.dayMany }, locale })}`;
};

export const resolveLocale = (raw: string | null | undefined): BotLocale => (raw?.toLowerCase().startsWith(LABEL.russianPrefix) ? 'ru' : 'en');

export const refusalText = ({ error, copies, fallback, onUnknown }: RefusalTextInput): string => {
  const code = errorCodeOf(error);
  const known = isNonNullish(code) ? copies[code] : undefined;

  if (isNonNullish(known)) {
    return known;
  }

  onUnknown(error);

  return fallback;
};

export const planLabel = ({ planId, locale }: PlanLabelInput): string => {
  const plan = PLANS.find((each) => each.id === planId);

  return plan ? `${plan.months} ${BOT_TEXT[locale].monthShort}` : planId;
};

export const nodeLabel = ({ node, locale }: NodeLabelInput): string => {
  const flag = countryFlag(node.countryCode);
  const country = [flag, countryName({ locale, countryCode: node.countryCode, fallback: node.country })].filter(isTruthy).join(' ');

  return [country, node.city].filter(isTruthy).join(LABEL.citySeparator);
};
