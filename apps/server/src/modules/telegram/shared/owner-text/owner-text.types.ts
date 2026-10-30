import type { PaymentKind, PeriodKind, PlanId } from '@gnomevpn/schemas';
import type { User } from 'grammy/types';

import type { StatsSnapshot } from '@/modules/admin';
import type { BotLocale } from '@/modules/telegram/telegram.types';

import type { LabelledNode } from '../text';

export type LoadResource = 'cpu' | 'memory';

export type NodeRestart = 'core' | 'reboot';

export type RefundAlertReason = 'canceled' | 'discountUsed' | 'lapsed' | 'manual' | 'orphan' | 'partial';

export type AlertAccount = {
  userId: string | null;
  email: string | null;
  username: string | null;
  telegramId: bigint | null;
};

export type AlertPurchase = {
  kind: PaymentKind;
  plan: PlanId | null;
  extraDevices: number;
};

export type AccountLabelInput = {
  account: AlertAccount;
  locale: BotLocale;
};

export type PurchaseLabelInput = {
  purchase: AlertPurchase;
  locale: BotLocale;
};

export type NodeAlertKind = 'down' | 'recovered';

export type NodeAlertTextInput = {
  alert: NodeAlertKind;
  node: string;
  healthyAt: Date;
  now: Date;
  locale: BotLocale;
};

export type RestartAlertTextInput = {
  restart: NodeRestart;
  node: string;
  restartedAt: Date;
  now: Date;
  locale: BotLocale;
};

export type LoadAlertTextInput = {
  resource: LoadResource;
  node: string;
  percent: number;
  locale: BotLocale;
};

export type ReconcileAlertTextInput = {
  node: string;
  streak: number;
  error: string;
  locale: BotLocale;
};

export type PaymentAlertTextInput = {
  purchase: AlertPurchase;
  amount: number;
  account: AlertAccount;
  isAutoCharge: boolean;
  locale: BotLocale;
};

export type RefundAlertTextInput = {
  purchase: AlertPurchase;
  amount: number;
  account: AlertAccount;
  reason: RefundAlertReason;
  locale: BotLocale;
};

export type ChargeFailedTextInput = {
  account: AlertAccount;
  reason: string | null;
  isCardDropped: boolean;
  locale: BotLocale;
};

export type NodeStatus = 'down' | 'off' | 'up';

export type NodeSilenceInput = {
  healthyAt: Date;
  now: Date;
};

export type NodeStatusInput = NodeSilenceInput & {
  isAvailable: boolean;
};

export type NodeAlertState = {
  isAnnouncedDown: boolean;
  downAlertedAt: Date | null;
};

export type NodeAlertInput = NodeSilenceInput & {
  state: NodeAlertState | undefined;
  isUp: boolean;
};

export type NodeAlertOutcome = {
  state: NodeAlertState;
  alert: NodeAlertKind | null;
};

export type StatsNode = LabelledNode & {
  isAvailable: boolean;
  healthyAt: Date;
};

export type BotStats = Omit<StatsSnapshot, 'nodes'> & {
  nodes: StatsNode[];
};

export type StatsTextInput = {
  stats: BotStats;
  locale: BotLocale;
  now: Date;
};

export type NodeLineInput = {
  node: StatsNode;
  locale: BotLocale;
  now: Date;
};

export type SupportAccount = {
  email: string;
  locale: BotLocale;
  deviceCount: number;
  period: PeriodKind;
  plan: PlanId;
  currentPeriodEnd: Date | null;
};

export type SupportHeaderInput = {
  sender: User;
  account: SupportAccount | null;
  locale: BotLocale;
};

export type AccessLineInput = {
  account: SupportAccount;
  locale: BotLocale;
};
