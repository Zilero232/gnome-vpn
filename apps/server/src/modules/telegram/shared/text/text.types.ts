import type { ApiErrorCode, PlanId } from '@gnomevpn/schemas';

import type { BotLocale } from '@/modules/telegram/telegram.types';

export type TextToken =
  | 'ago'
  | 'amount'
  | 'audience'
  | 'blocked'
  | 'card'
  | 'chats'
  | 'code'
  | 'count'
  | 'date'
  | 'day'
  | 'days'
  | 'delivered'
  | 'effect'
  | 'email'
  | 'error'
  | 'failed'
  | 'friend'
  | 'how'
  | 'id'
  | 'invited'
  | 'limit'
  | 'link'
  | 'locale'
  | 'max'
  | 'min'
  | 'name'
  | 'names'
  | 'node'
  | 'percent'
  | 'plan'
  | 'plans'
  | 'platforms'
  | 'price'
  | 'reason'
  | 'referrer'
  | 'rewarded'
  | 'server'
  | 'site'
  | 'used'
  | 'user'
  | 'week';

export type TextFill = Partial<Record<TextToken, string>>;

export type FillTextInput = {
  text: string;
  fill: TextFill;
};

export type FormatDateInput = {
  iso: string | null;
  locale: BotLocale;
};

export type FormatAgoInput = {
  date: Date;
  now: Date;
  locale: BotLocale;
};

export type FormatAmountInput = {
  amount: number;
  locale: BotLocale;
};

export type DayCountInput = {
  days: number;
  locale: BotLocale;
};

export type RefusalTextInput = {
  error: unknown;
  copies: Partial<Record<ApiErrorCode, string>>;
  fallback: string;
  onUnknown: (error: unknown) => void;
};

export type PlanLabelInput = {
  planId: PlanId;
  locale: BotLocale;
};

export type LabelledNode = {
  country: string;
  countryCode: string;
  city: string | null;
};

export type NodeLabelInput = {
  node: LabelledNode;
  locale: BotLocale;
};
