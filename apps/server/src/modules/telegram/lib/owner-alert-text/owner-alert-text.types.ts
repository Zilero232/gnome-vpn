import type { PlanId } from '@gnomevpn/schemas';

import type { BotLocale } from '../../telegram.types';
import type { NodeAlertKind } from '../node-health';

export type LoadResource = 'cpu' | 'memory';

export type RefundAlertReason = 'canceled' | 'discountUsed' | 'lapsed' | 'manual' | 'orphan' | 'partial';

export type AlertAccount = {
  userId: string | null;
  email: string | null;
  username: string | null;
  telegramId: bigint | null;
};

export type AlertPurchase = {
  kind: 'extraDevices' | 'gift' | 'subscription';
  plan: PlanId;
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

export type NodeAlertTextInput = {
  alert: NodeAlertKind;
  node: string;
  healthyAt: Date;
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
