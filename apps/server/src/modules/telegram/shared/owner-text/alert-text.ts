import { isPlaceholderEmail } from '@gnomevpn/schemas';
import { isNonNullish, isTruthy } from 'remeda';
import { match } from 'ts-pattern';

import { paymentPlan } from '@/common/lib';
import { BOT_TEXT } from '@/modules/telegram/config';

import type {
  AccountLabelInput,
  ChargeFailedTextInput,
  LoadAlertTextInput,
  NodeAlertTextInput,
  PaymentAlertTextInput,
  PurchaseLabelInput,
  ReconcileAlertTextInput,
  RefundAlertTextInput,
  RestartAlertTextInput
} from './owner-text.types';

import { fillLabel, fillText, formatAgo, formatAmount, planLabel } from '../text';
import { ALERT_TEXT, OWNER_ALERT } from './owner-text.constants';

const accountLabel = ({ account, locale }: AccountLabelInput): string => {
  const { userId, email, username, telegramId } = account;
  const parts = [
    isNonNullish(email) && !isPlaceholderEmail(email) ? email : null,
    isNonNullish(username) ? `@${username}` : null,
    isNonNullish(telegramId) ? `tg ${telegramId}` : null
  ].filter(isTruthy);

  if (parts.length > 0) {
    return parts.join(ALERT_TEXT.separator);
  }

  return isNonNullish(userId) ? `id ${userId}` : BOT_TEXT[locale].alertNoUser;
};

const purchaseLabel = ({ purchase, locale }: PurchaseLabelInput): string =>
  match(purchase.kind)
    .with('extraDevices', () => fillLabel({ text: BOT_TEXT[locale].alertDevicesItem, fill: { count: String(purchase.extraDevices) } }))
    .with('gift', () => fillLabel({ text: BOT_TEXT[locale].alertGiftItem, fill: { plan: planLabel({ planId: paymentPlan(purchase), locale }) } }))
    .with('subscription', () => planLabel({ planId: paymentPlan(purchase), locale }))
    .exhaustive();

export const nodeAlertText = ({ alert, node, healthyAt, now, locale }: NodeAlertTextInput): string => {
  const text = BOT_TEXT[locale];

  return match(alert)
    .with('down', () => fillText({ text: text.alertNodeDown, fill: { node, ago: formatAgo({ date: healthyAt, now, locale }) } }))
    .with('recovered', () => fillText({ text: text.alertNodeUp, fill: { node } }))
    .exhaustive();
};

export const loadAlertText = ({ resource, node, percent, locale }: LoadAlertTextInput): string =>
  fillText({ text: BOT_TEXT[locale][ALERT_TEXT.load[resource]], fill: { node, percent: percent.toFixed(0) } });

export const restartAlertText = ({ restart, node, restartedAt, now, locale }: RestartAlertTextInput): string =>
  fillText({ text: BOT_TEXT[locale][ALERT_TEXT.restart[restart]], fill: { node, ago: formatAgo({ date: restartedAt, now, locale }) } });

export const reconcileAlertText = ({ node, streak, error, locale }: ReconcileAlertTextInput): string =>
  fillText({ text: BOT_TEXT[locale].alertReconcile, fill: { node, count: String(streak), error: error.slice(0, OWNER_ALERT.errorLength) } });

export const paymentAlertText = ({ purchase, amount, account, isAutoCharge, locale }: PaymentAlertTextInput): string => {
  const text = BOT_TEXT[locale];

  return fillText({
    text: isAutoCharge ? text.alertRenewed : text.alertPaid,
    fill: { amount: formatAmount({ amount, locale }), plan: purchaseLabel({ purchase, locale }), user: accountLabel({ account, locale }) }
  });
};

export const refundAlertText = ({ purchase, amount, account, reason, locale }: RefundAlertTextInput): string => {
  const text = BOT_TEXT[locale];

  return fillText({
    text: text.alertRefund,
    fill: {
      amount: formatAmount({ amount, locale }),
      plan: purchaseLabel({ purchase, locale }),
      user: accountLabel({ account, locale }),
      reason: text[ALERT_TEXT.refundReason[reason]]
    }
  });
};

export const chargeFailedText = ({ account, reason, isCardDropped, locale }: ChargeFailedTextInput): string => {
  const text = BOT_TEXT[locale];

  return [
    fillText({ text: text.alertChargeFailed, fill: { user: accountLabel({ account, locale }) } }),
    reason ? fillText({ text: text.alertChargeReason, fill: { reason } }) : null,
    isCardDropped ? text.alertCardDropped : null
  ]
    .filter(isTruthy)
    .join('\n');
};
