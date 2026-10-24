import type { Api } from 'grammy';

import type { CampaignProblem, CampaignSummary, CreateCampaignInput, PromoCampaign } from '@/modules/promo-codes';

import type { BroadcastAudience, BroadcastChoice } from '../shared/callback-data';
import type { BotLocale, BotText } from '../telegram.types';

export type BroadcastChat = {
  telegramId: bigint;
  hasAccess: boolean;
};

export type AudienceInput = {
  chats: BroadcastChat[];
  audience: BroadcastAudience;
};

export type SendWaitInput = {
  lastSentAt: number | null;
  now: number;
};

export type BroadcastTally = {
  delivered: number;
  blocked: number;
  failed: number;
};

export type BroadcastDelivery = 'blocked' | 'delivered' | 'failed' | 'missing';

export type BroadcastReportInput = {
  tally: BroadcastTally;
  isAborted: boolean;
  locale: BotLocale;
};

export type BroadcastKeyboardInput = {
  locale: BotLocale;
  source: number;
};

export type BroadcastConfirmInput = {
  choice: BroadcastChoice;
  count: number;
  locale: BotLocale;
};

export type BroadcastRunInput = {
  api: Api;
  recipients: bigint[];
  chatId: number;
  source: number;
  locale: BotLocale;
};

export type BroadcastSendInput = {
  api: Api;
  telegramId: bigint;
  chatId: number;
  source: number;
  attempt: number;
};

export type PromoCommand =
  { action: 'create'; input: CreateCampaignInput } | { action: 'list' } | { action: 'stop'; code: string } | { action: 'unknown' };

export type CampaignOptions = {
  effect: { kind: 'days'; days: number } | { kind: 'discount'; percent: number } | null;
  maxUses: number | null;
  expiresAt: Date | null;
};

export type ReadOptionInput = {
  token: string;
  options: CampaignOptions;
};

export type CampaignTextInput = {
  campaign: PromoCampaign;
  locale: BotLocale;
};

export type CampaignCreatedTextInput = CampaignTextInput & {
  link: string;
};

export type CampaignLineInput = {
  campaign: CampaignSummary;
  locale: BotLocale;
  now: Date;
};

export type CampaignListTextInput = {
  campaigns: CampaignSummary[];
  locale: BotLocale;
  now: Date;
};

export type CampaignProblemTextInput = {
  problem: CampaignProblem;
  locale: BotLocale;
};

export type CampaignProblemText = {
  key: keyof BotText;
  min?: number;
  max?: number;
};

export type PromoAnswerInput = {
  command: PromoCommand;
  locale: BotLocale;
  now: Date;
};

export type PromoCreateInput = {
  input: CreateCampaignInput;
  locale: BotLocale;
  now: Date;
};
