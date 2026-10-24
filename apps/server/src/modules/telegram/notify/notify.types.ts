import type { PlanId } from '@gnomevpn/schemas';
import type { Bot } from 'grammy';

import type { BOT_THROTTLE } from '../config';
import type { AlertPurchase, LoadResource, RefundAlertReason } from '../shared/owner-text';
import type { BotLocale, NoticeSpec, NotifyInput } from '../telegram.types';

export type NotifiedChat = {
  telegramId: bigint;
  locale: BotLocale;
  isBlocked: boolean;
};

export type SetLocaleInput = {
  telegramId: bigint;
  locale: BotLocale;
};

export type SetBlockedInput = {
  telegramId: bigint;
  blockedAt: Date | null;
};

export type DirectMessageInput = {
  userId: string;
  text: string;
};

export type MarkupForInput = {
  userId: string;
  locale: BotLocale;
  markup: NoticeSpec['markup'];
  isPromotional?: boolean;
};

export type NoticeTextInput = {
  userId: string;
  spec: NoticeSpec;
  text: string;
  hint: string;
};

export type SendNoticeInput = {
  bot: Bot;
  chat: NotifiedChat;
  input: NotifyInput;
};

export type DeliverInput = {
  chat: NotifiedChat;
  send: () => Promise<unknown>;
};

export type NoticeEmailInput = Pick<NotifyInput, 'date' | 'fill' | 'notice' | 'userId'>;

export type NoticeLayoutInput = {
  text: string;
  markup: NoticeSpec['markup'];
  prompt: string | null;
};

export type NoticeLayout = {
  text: string;
  markup: NoticeSpec['markup'];
  followUp: string | null;
};

export type InviteLineInput = {
  planId: PlanId;
  locale: BotLocale;
};

export type BotThrottle = keyof typeof BOT_THROTTLE.limits;

export type AllowInput = {
  throttle: BotThrottle;
  key: string;
};

export type OnceInput = AllowInput & {
  run: () => void;
};

export type NodeProbeInput = {
  nodeId: string;
  isUp: boolean;
  healthyAt: Date;
};

export type NodeLoadInput = {
  nodeId: string;
  resource: LoadResource;
  percent: number;
};

export type ReconcileFailingInput = {
  nodeId: string;
  streak: number;
  error: string;
};

export type PaymentSettledInput = {
  userId: string;
  purchase: AlertPurchase;
  amount: number;
  isAutoCharge: boolean;
};

export type PaymentRefundedInput = {
  userId: string | null;
  purchase: AlertPurchase;
  amount: number;
  reason: RefundAlertReason;
};

export type RefundCanceledInput = Omit<PaymentRefundedInput, 'reason'> & {
  paymentId: string;
};

export type ChargeFailedInput = {
  userId: string;
  reason: string | null;
  isCardDropped: boolean;
};
