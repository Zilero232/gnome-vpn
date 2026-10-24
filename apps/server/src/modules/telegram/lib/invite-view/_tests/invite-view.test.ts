import type { ReferralOverview } from '@gnomevpn/schemas';

import { REFERRAL_REWARDS } from '@gnomevpn/schemas';
import { assert, describe, expect, it } from 'vitest';

import { isTelegramHtml } from '@/modules/telegram/lib/html';

import { inviteLine, inviteView, shareUrl } from '../invite-view';

const OVERVIEW: ReferralOverview = {
  code: 'ABCDEF23',
  link: 'https://gnome-vpn.com/?ref=ABCDEF23',
  telegramLink: 'https://t.me/GnomeVpnBot?start=ref_ABCDEF23',
  invited: 4,
  rewarded: 2,
  daysEarned: 14,
  pendingDays: 0,
  isReferred: false,
  isReferralRewarded: false,
  referralRewardedDays: 0,
  canBeReferred: false
};

const buttonsOf = (overview: ReferralOverview) => inviteView({ overview, locale: 'ru' }).markup?.inline_keyboard.flat() ?? [];

describe('inviteView', () => {
  it('renders markup Telegram accepts in both languages', () => {
    expect(isTelegramHtml(inviteView({ overview: OVERVIEW, locale: 'ru' }).text)).toBe(true);
    expect(isTelegramHtml(inviteView({ overview: OVERVIEW, locale: 'en' }).text)).toBe(true);
  });

  it('shows the counters and both links', () => {
    const { text } = inviteView({ overview: OVERVIEW, locale: 'ru' });

    expect(text).toContain('<b>4</b>');
    expect(text).toContain('<b>2</b>');
    expect(text).toContain('14 дней');
    expect(text).toContain(OVERVIEW.link);
    expect(text).toContain(OVERVIEW.telegramLink);
  });

  it('gives the promo code itself, for a friend who signs up without the link', () => {
    expect(inviteView({ overview: OVERVIEW, locale: 'ru' }).text).toContain(`<code>${OVERVIEW.code}</code>`);
  });

  it('shares the bot link when there is one', () => {
    const [share] = buttonsOf(OVERVIEW);

    assert(share);
    expect('url' in share && share.url).toContain(encodeURIComponent(OVERVIEW.telegramLink ?? ''));
  });

  it('falls back to the site link when the bot has no username', () => {
    const overview = { ...OVERVIEW, telegramLink: null };
    const { text } = inviteView({ overview, locale: 'ru' });
    const [share] = buttonsOf(overview);

    assert(share);
    expect(text).not.toContain('t.me/GnomeVpnBot');
    expect('url' in share && share.url).toContain(encodeURIComponent(OVERVIEW.link));
  });
});

describe('inviteView pending days', () => {
  it('mentions the days waiting for the next payment only when there are some', () => {
    expect(inviteView({ overview: OVERVIEW, locale: 'ru' }).text).not.toContain('Ждут');
    expect(inviteView({ overview: { ...OVERVIEW, pendingDays: 7 }, locale: 'ru' }).text).toContain('Ждут следующей оплаты: <b>7 дней</b>');
  });
});

describe('shareUrl', () => {
  it('opens the Telegram share sheet with the link and the message', () => {
    const url = new URL(shareUrl({ url: 'https://gnome-vpn.com/?ref=ABCDEF23', text: 'Привет & пока' }));

    expect(url.origin + url.pathname).toBe('https://t.me/share/url');
    expect(url.searchParams.get('url')).toBe('https://gnome-vpn.com/?ref=ABCDEF23');
    expect(url.searchParams.get('text')).toBe('Привет & пока');
  });
});

describe('inviteLine', () => {
  it('names the rewards of the plan it is given, both ways', () => {
    const line = inviteLine({ planId: 'yearly', locale: 'en' });

    expect(line).toContain(`+${REFERRAL_REWARDS.yearly.referrerDays} days`);
    expect(line).toContain(`+${REFERRAL_REWARDS.yearly.friendDays} days`);
    expect(line).toContain('12 mo');
  });

  it('renders markup Telegram accepts in both languages', () => {
    expect(isTelegramHtml(inviteLine({ planId: 'monthly', locale: 'ru' }))).toBe(true);
    expect(isTelegramHtml(inviteLine({ planId: 'monthly', locale: 'en' }))).toBe(true);
  });
});
