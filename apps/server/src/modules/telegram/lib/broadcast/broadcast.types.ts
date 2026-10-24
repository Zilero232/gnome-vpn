import type { BROADCAST_AUDIENCES } from '@/modules/telegram/config';
import type { BotLocale } from '@/modules/telegram/telegram.types';

export type BroadcastAudience = (typeof BROADCAST_AUDIENCES)[number];

export type BroadcastChat = {
  telegramId: bigint;
  hasAccess: boolean;
};

export type AudienceInput = {
  chats: BroadcastChat[];
  audience: BroadcastAudience;
};

export type BroadcastChoice = {
  audience: BroadcastAudience;
  source: number;
};

export type BroadcastAnswer = BroadcastChoice & {
  isConfirmed: boolean;
};

export type SendWaitInput = {
  lastSentAt: number | null;
  now: number;
};

export type DeliveryOutcome = { kind: 'blocked' } | { kind: 'failed' } | { kind: 'flood'; retryAfterSeconds: number } | { kind: 'missing' };

export type BroadcastTally = {
  delivered: number;
  blocked: number;
  failed: number;
};

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
