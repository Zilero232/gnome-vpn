import { DEFAULT_PLAN_ID, telegramPlaceholderEmail } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import type { AlertAccount, AlertPurchase } from '../owner-alert-text.types';

import { BOT_TEXT, OWNER_ALERT } from '../../../config';
import { html } from '../../html';
import { planLabel } from '../../plan-label';
import { chargeFailedText, paymentAlertText, reconcileAlertText, refundAlertText } from '../owner-alert-text';

const TELEGRAM_ID = 123_456_789n;

const account: AlertAccount = { userId: 'user-1', email: 'ivan@example.com', username: 'ivan', telegramId: TELEGRAM_ID };

const subscription: AlertPurchase = { kind: 'subscription', plan: DEFAULT_PLAN_ID, extraDevices: 0 };

const extraPlaces: AlertPurchase = { kind: 'extraDevices', plan: null, extraDevices: 2 };

describe('paymentAlertText', () => {
  it('names the plan, the amount and who paid', () => {
    const text = paymentAlertText({ purchase: subscription, amount: 299, account, isAutoCharge: false, locale: 'ru' });

    expect(text).toContain(planLabel({ planId: DEFAULT_PLAN_ID, locale: 'ru' }));
    expect(text).toContain('299');
    expect(text).toContain(account.email);
  });

  it('tells an automatic renewal from a payment made by hand', () => {
    const byHand = paymentAlertText({ purchase: subscription, amount: 299, account, isAutoCharge: false, locale: 'en' });
    const renewal = paymentAlertText({ purchase: subscription, amount: 299, account, isAutoCharge: true, locale: 'en' });

    expect(byHand).not.toBe(renewal);
  });

  it('names extra device places by their count rather than a plan', () => {
    const text = paymentAlertText({ purchase: extraPlaces, amount: 100, account, isAutoCharge: false, locale: 'ru' });

    expect(text).toContain(String(extraPlaces.extraDevices));
    expect(text).not.toContain(planLabel({ planId: DEFAULT_PLAN_ID, locale: 'ru' }));
  });

  it('falls back to the Telegram handle for an account whose email is a placeholder', () => {
    const placeholder = telegramPlaceholderEmail(TELEGRAM_ID);
    const text = paymentAlertText({
      purchase: subscription,
      amount: 299,
      account: { ...account, email: placeholder },
      isAutoCharge: false,
      locale: 'ru'
    });

    expect(text).not.toContain(placeholder);
    expect(text).toContain('@ivan');
    expect(text).toContain(String(TELEGRAM_ID));
  });

  it('still names an account that has no contact at all', () => {
    const anonymous = { userId: 'user-1', email: null, username: null, telegramId: null };

    expect(paymentAlertText({ purchase: subscription, amount: 1, account: anonymous, isAutoCharge: false, locale: 'en' })).toContain('user-1');
  });
});

describe('refundAlertText', () => {
  it('says why the money went back', () => {
    const empty = { userId: null, email: null, username: null, telegramId: null };
    const text = refundAlertText({ purchase: subscription, amount: 299, account: empty, reason: 'orphan', locale: 'ru' });

    expect(text).toContain(BOT_TEXT.ru.alertRefundOrphan);
    expect(text).toContain(BOT_TEXT.ru.alertNoUser);
  });
});

describe('chargeFailedText', () => {
  it('quotes the reason YooKassa gave and says the card was dropped', () => {
    const text = chargeFailedText({ account, reason: 'card_expired', isCardDropped: true, locale: 'en' });

    expect(text).toContain('card_expired');
    expect(text).toContain(BOT_TEXT.en.alertCardDropped);
  });

  it('leaves out the lines it has nothing for', () => {
    const text = chargeFailedText({ account, reason: null, isCardDropped: false, locale: 'en' });

    expect(text.split('\n')).toHaveLength(BOT_TEXT.en.alertChargeFailed.split('\n').length);
  });
});

describe('reconcileAlertText', () => {
  it('escapes the error and keeps it short', () => {
    const error = `<${'x'.repeat(OWNER_ALERT.errorLength * 2)}`;
    const text = reconcileAlertText({ node: 'DE', streak: 5, error, locale: 'ru' });

    expect(text).toContain(html.escape('<'));
    expect(text).not.toContain('x'.repeat(OWNER_ALERT.errorLength));
  });
});
