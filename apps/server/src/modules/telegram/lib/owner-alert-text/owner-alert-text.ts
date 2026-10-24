import { isTruthy } from 'remeda';
import { match } from 'ts-pattern';

import { BOT_TEXT, NEW_LINE, OWNER_ALERT } from '@/modules/telegram/config';

import type {
  ChargeFailedTextInput,
  LoadAlertTextInput,
  NodeAlertTextInput,
  PaymentAlertTextInput,
  ReconcileAlertTextInput,
  RefundAlertTextInput
} from './owner-alert-text.types';

import { fillText } from '../fill-text';
import { formatAmount } from '../format-amount';
import { formatAgo } from '../format-date';
import { LOAD_TEXT, REFUND_REASON_TEXT } from './owner-alert-text.constants';
import { accountLabel, purchaseLabel } from './owner-alert-text.helpers';

export const nodeAlertText = ({ alert, node, healthyAt, now, locale }: NodeAlertTextInput): string => {
  const text = BOT_TEXT[locale];

  return match(alert)
    .with('down', () => fillText({ text: text.alertNodeDown, fill: { node, ago: formatAgo({ date: healthyAt, now, locale }) } }))
    .with('recovered', () => fillText({ text: text.alertNodeUp, fill: { node } }))
    .exhaustive();
};

export const loadAlertText = ({ resource, node, percent, locale }: LoadAlertTextInput): string =>
  fillText({ text: BOT_TEXT[locale][LOAD_TEXT[resource]], fill: { node, percent: percent.toFixed(0) } });

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
      reason: text[REFUND_REASON_TEXT[reason]]
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
    .join(NEW_LINE);
};
