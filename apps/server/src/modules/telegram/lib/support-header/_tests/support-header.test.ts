import type { User } from 'grammy/types';

import { DEFAULT_PLAN_ID, telegramPlaceholderEmail } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { BOT_TEXT } from '@/modules/telegram/config';
import { html } from '@/modules/telegram/lib/html';
import { planLabel } from '@/modules/telegram/lib/plan-label';

import type { SupportAccount } from '../support-header.types';

import { supportHeader } from '../support-header';

const sender: User = { id: 123_456_789, is_bot: false, first_name: 'Ivan', last_name: 'Petrov', username: 'ivan', language_code: 'ru' };

const account: SupportAccount = {
  email: 'ivan@example.com',
  locale: 'ru',
  deviceCount: 2,
  period: 'paid',
  plan: DEFAULT_PLAN_ID,
  currentPeriodEnd: new Date('2026-11-23T12:00:00.000Z')
};

const lines = (header: string): string[] => header.split('\n');

describe('supportHeader', () => {
  it('names the sender with their username and the id a reply goes to', () => {
    const [title] = lines(supportHeader({ sender, account, locale: 'ru' }));

    expect(title).toContain('Ivan Petrov');
    expect(title).toContain('@ivan');
    expect(title).toContain(String(sender.id));
  });

  it('escapes a name that looks like markup, so a user cannot break the header', () => {
    const header = supportHeader({ sender: { ...sender, first_name: '<b>' }, account, locale: 'ru' });

    expect(header).toContain(html.escape('<b>'));
  });

  it('shows the email of a linked account and the devices on it', () => {
    const header = supportHeader({ sender, account, locale: 'ru' });

    expect(header).toContain(account.email);
    expect(header).toContain(String(account.deviceCount));
  });

  it('never shows the placeholder address of a Telegram-born account', () => {
    const placeholder = telegramPlaceholderEmail(BigInt(sender.id));
    const header = supportHeader({ sender, account: { ...account, email: placeholder }, locale: 'ru' });

    expect(header).not.toContain(placeholder);
    expect(header).toContain(BOT_TEXT.ru.supportNoEmail);
  });

  it('names the plan of a paid period', () => {
    const header = supportHeader({ sender, account, locale: 'ru' });

    expect(header).toContain(planLabel({ planId: account.plan, locale: 'ru' }));
  });

  it('tells a lapsed account from one that never had access', () => {
    const lapsed = supportHeader({ sender, account: { ...account, period: 'none' }, locale: 'ru' });
    const never = supportHeader({ sender, account: { ...account, period: 'none', currentPeriodEnd: null }, locale: 'ru' });

    expect(lines(never).at(-1)).toBe(BOT_TEXT.ru.supportNever);
    expect(lines(lapsed).at(-1)).not.toBe(BOT_TEXT.ru.supportNever);
  });

  it('says when a chat has no account behind it', () => {
    const header = supportHeader({ sender, account: null, locale: 'ru' });

    expect(lines(header)).toHaveLength(2);
    expect(header).not.toContain(BOT_TEXT.ru.supportNoEmail);
  });
});
