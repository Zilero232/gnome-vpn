import type { User } from 'grammy/types';

import { DEFAULT_PLAN_ID, PLANS, telegramPlaceholderEmail } from '@gnomevpn/schemas';
import { addMilliseconds, addMinutes, subMinutes } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { BOT_TEXT } from '@/modules/telegram/config';
import { dayCount, html, nodeLabel, planLabel } from '@/modules/telegram/shared/text';

import type { AlertAccount, AlertPurchase, BotStats, NodeAlertState, StatsNode, SupportAccount } from '../owner-text.types';

import { chargeFailedText, paymentAlertText, reconcileAlertText, refundAlertText } from '../alert-text';
import { nodeAlert, nodeStatus } from '../node-health';
import { OWNER_ALERT } from '../owner-text.constants';
import { statsText } from '../stats-text';
import { supportHeader } from '../support-header';

const TELEGRAM_ID = 123_456_789n;

const alertAccount: AlertAccount = { userId: 'user-1', email: 'ivan@example.com', username: 'ivan', telegramId: TELEGRAM_ID };

const subscription: AlertPurchase = { kind: 'subscription', plan: DEFAULT_PLAN_ID, extraDevices: 0 };

const extraPlaces: AlertPurchase = { kind: 'extraDevices', plan: null, extraDevices: 2 };

const START = new Date('2026-10-23T12:00:00.000Z');
const HEALTHY_AT = START;
const SILENT = addMinutes(START, OWNER_ALERT.nodeDownAfterMinutes);

const failAt = (now: Date, state?: NodeAlertState) => nodeAlert({ state, isUp: false, healthyAt: HEALTHY_AT, now });

const recoverAt = (now: Date, state?: NodeAlertState) => nodeAlert({ state, isUp: true, healthyAt: now, now });

const NOW = new Date('2026-10-23T12:00:00.000Z');

const [first, second] = PLANS;

const subscriptions: BotStats['subscriptions'] = {
  paid: [
    { plan: first.id, count: 2 },
    { plan: second.id, count: 1 }
  ],
  trials: 1,
  autoRenew: 2
};

const node = (patch: Partial<StatsNode>): StatsNode => ({
  country: 'Germany',
  countryCode: 'DE',
  city: 'Frankfurt',
  isAvailable: true,
  healthyAt: NOW,
  ...patch
});

const stats = (patch: Partial<BotStats> = {}): BotStats => ({
  users: { total: 1234, day: 56, week: 789 },
  subscriptions,
  payments: { days: 30, count: 17, amount: 4321 },
  devices: 321,
  chats: 99,
  nodes: [node({})],
  ...patch
});

const sender: User = { id: 123_456_789, is_bot: false, first_name: 'Ivan', last_name: 'Petrov', username: 'ivan', language_code: 'ru' };

const supportAccount: SupportAccount = {
  email: 'ivan@example.com',
  locale: 'ru',
  deviceCount: 2,
  period: 'paid',
  plan: DEFAULT_PLAN_ID,
  currentPeriodEnd: new Date('2026-11-23T12:00:00.000Z')
};

const lines = (header: string): string[] => header.split('\n');

describe('paymentAlertText', () => {
  it('names the plan, the amount and who paid', () => {
    const text = paymentAlertText({ purchase: subscription, amount: 299, account: alertAccount, isAutoCharge: false, locale: 'ru' });

    expect(text).toContain(planLabel({ planId: DEFAULT_PLAN_ID, locale: 'ru' }));
    expect(text).toContain('299');
    expect(text).toContain(alertAccount.email);
  });

  it('tells an automatic renewal from a payment made by hand', () => {
    const byHand = paymentAlertText({ purchase: subscription, amount: 299, account: alertAccount, isAutoCharge: false, locale: 'en' });
    const renewal = paymentAlertText({ purchase: subscription, amount: 299, account: alertAccount, isAutoCharge: true, locale: 'en' });

    expect(byHand).not.toBe(renewal);
  });

  it('names extra device places by their count rather than a plan', () => {
    const text = paymentAlertText({ purchase: extraPlaces, amount: 100, account: alertAccount, isAutoCharge: false, locale: 'ru' });

    expect(text).toContain(String(extraPlaces.extraDevices));
    expect(text).not.toContain(planLabel({ planId: DEFAULT_PLAN_ID, locale: 'ru' }));
  });

  it('falls back to the Telegram handle for an account whose email is a placeholder', () => {
    const placeholder = telegramPlaceholderEmail(TELEGRAM_ID);
    const text = paymentAlertText({
      purchase: subscription,
      amount: 299,
      account: { ...alertAccount, email: placeholder },
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
    const text = chargeFailedText({ account: alertAccount, reason: 'card_expired', isCardDropped: true, locale: 'en' });

    expect(text).toContain('card_expired');
    expect(text).toContain(BOT_TEXT.en.alertCardDropped);
  });

  it('leaves out the lines it has nothing for', () => {
    const text = chargeFailedText({ account: alertAccount, reason: null, isCardDropped: false, locale: 'en' });

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

describe('nodeAlert', () => {
  it('stays quiet about a failed probe while the node has not been silent for long', () => {
    expect(failAt(subMinutes(SILENT, 1)).alert).toBeNull();
  });

  it('announces a node that has been silent past the threshold', () => {
    expect(failAt(SILENT).alert).toBe('down');
  });

  it('says it once, not on every probe while the node stays down', () => {
    const { state } = failAt(SILENT);

    expect(failAt(addMinutes(SILENT, 1), state).alert).toBeNull();
  });

  it('repeats the warning once the repeat window has passed and the node is still down', () => {
    const { state } = failAt(SILENT);

    expect(failAt(addMilliseconds(SILENT, OWNER_ALERT.repeatMs), state).alert).toBe('down');
  });

  it('announces the recovery of a node it said was down', () => {
    const { state } = failAt(SILENT);

    expect(recoverAt(addMinutes(SILENT, 1), state).alert).toBe('recovered');
  });

  it('says nothing about a recovery nobody was told to wait for', () => {
    expect(recoverAt(START).alert).toBeNull();
  });

  it('does not spam a flapping node: within the window it falls silent after one down and one recovery', () => {
    const down = failAt(SILENT);
    const up = recoverAt(addMinutes(SILENT, 1), down.state);
    const downAgain = failAt(addMinutes(SILENT, 10), up.state);
    const upAgain = recoverAt(addMinutes(SILENT, 11), downAgain.state);

    expect([down.alert, up.alert, downAgain.alert, upAgain.alert]).toEqual(['down', 'recovered', null, null]);
  });

  it('catches up with a node that went down while it was holding back', () => {
    const down = failAt(SILENT);
    const up = recoverAt(addMinutes(SILENT, 1), down.state);
    const suppressed = failAt(addMinutes(SILENT, 10), up.state);

    expect(failAt(addMilliseconds(SILENT, OWNER_ALERT.repeatMs), suppressed.state).alert).toBe('down');
  });
});

describe('nodeStatus', () => {
  it('reports a node switched off by hand as off, however it answers', () => {
    expect(nodeStatus({ isAvailable: false, healthyAt: START, now: START })).toBe('off');
  });

  it('uses the same threshold as the alert, so the stats and the alerts agree', () => {
    expect(nodeStatus({ isAvailable: true, healthyAt: HEALTHY_AT, now: subMinutes(SILENT, 1) })).toBe('up');
    expect(nodeStatus({ isAvailable: true, healthyAt: HEALTHY_AT, now: SILENT })).toBe('down');
  });
});

describe('statsText', () => {
  it('reports every figure it was given', () => {
    const text = statsText({ stats: stats(), locale: 'ru', now: NOW });

    for (const figure of [1234, 56, 789, 17, 321, 99]) {
      expect(text).toContain(String(figure));
    }
  });

  it('names the window the payments were counted over', () => {
    const days = 7;
    const text = statsText({ stats: stats({ payments: { days, count: 1, amount: 200 } }), locale: 'en', now: NOW });

    expect(text).toContain(dayCount({ days, locale: 'en' }));
  });

  it('marks each node by how it answers', () => {
    const silent = subMinutes(NOW, OWNER_ALERT.nodeDownAfterMinutes);
    const up = node({});
    const quiet = node({ countryCode: 'NL', country: 'Netherlands', healthyAt: silent });
    const off = node({ countryCode: 'FI', isAvailable: false });
    const nodes = [up, quiet, off];
    const statLines = statsText({ stats: stats({ nodes }), locale: 'en', now: NOW }).split('\n');
    const lineOf = (each: StatsNode) => statLines.find((line) => line.includes(nodeLabel({ node: each, locale: 'en' })));

    const [, offSuffix = ''] = BOT_TEXT.en.statsNodeOff.split('{node}');

    expect(lineOf(up)?.startsWith(BOT_TEXT.en.statsNodeUp.replace('{node}', ''))).toBe(true);
    expect(lineOf(quiet)).toContain('ago');
    expect(lineOf(off)?.endsWith(offSuffix)).toBe(true);
  });

  it('does not call a node down before the alert would', () => {
    const text = statsText({
      stats: stats({ nodes: [node({ healthyAt: addMinutes(subMinutes(NOW, OWNER_ALERT.nodeDownAfterMinutes), 1) })] }),
      locale: 'en',
      now: NOW
    });

    expect(text).not.toContain('ago');
  });

  it('says so when there are no nodes rather than printing an empty list', () => {
    expect(statsText({ stats: stats({ nodes: [] }), locale: 'ru', now: NOW })).toContain(BOT_TEXT.ru.statsNoNodes);
  });
});

describe('supportHeader', () => {
  it('names the sender with their username and the id a reply goes to', () => {
    const [title] = lines(supportHeader({ sender, account: supportAccount, locale: 'ru' }));

    expect(title).toContain('Ivan Petrov');
    expect(title).toContain('@ivan');
    expect(title).toContain(String(sender.id));
  });

  it('escapes a name that looks like markup, so a user cannot break the header', () => {
    const header = supportHeader({ sender: { ...sender, first_name: '<b>' }, account: supportAccount, locale: 'ru' });

    expect(header).toContain(html.escape('<b>'));
  });

  it('shows the email of a linked account and the devices on it', () => {
    const header = supportHeader({ sender, account: supportAccount, locale: 'ru' });

    expect(header).toContain(supportAccount.email);
    expect(header).toContain(String(supportAccount.deviceCount));
  });

  it('never shows the placeholder address of a Telegram-born account', () => {
    const placeholder = telegramPlaceholderEmail(BigInt(sender.id));
    const header = supportHeader({ sender, account: { ...supportAccount, email: placeholder }, locale: 'ru' });

    expect(header).not.toContain(placeholder);
    expect(header).toContain(BOT_TEXT.ru.supportNoEmail);
  });

  it('names the plan of a paid period', () => {
    const header = supportHeader({ sender, account: supportAccount, locale: 'ru' });

    expect(header).toContain(planLabel({ planId: supportAccount.plan, locale: 'ru' }));
  });

  it('tells a lapsed account from one that never had access', () => {
    const lapsed = supportHeader({ sender, account: { ...supportAccount, period: 'none' }, locale: 'ru' });
    const never = supportHeader({ sender, account: { ...supportAccount, period: 'none', currentPeriodEnd: null }, locale: 'ru' });

    expect(lines(never).at(-1)).toBe(BOT_TEXT.ru.supportNever);
    expect(lines(lapsed).at(-1)).not.toBe(BOT_TEXT.ru.supportNever);
  });

  it('says when a chat has no account behind it', () => {
    const header = supportHeader({ sender, account: null, locale: 'ru' });

    expect(lines(header)).toHaveLength(2);
    expect(header).not.toContain(BOT_TEXT.ru.supportNoEmail);
  });
});
