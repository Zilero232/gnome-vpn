import { describe, expect, it } from 'vitest';

import { referralCodeFromStart, telegramReferralLink, telegramStartPayload, webReferralLink } from '../referral-link';

describe('webReferralLink', () => {
  it('puts the code on the landing page', () => {
    expect(webReferralLink({ clientUrl: 'https://gnome-vpn.com', code: 'ABCDEF23' })).toBe('https://gnome-vpn.com/?ref=ABCDEF23');
  });

  it('ignores a path already on the client URL', () => {
    expect(webReferralLink({ clientUrl: 'https://gnome-vpn.com/en/', code: 'ABCDEF23' })).toBe('https://gnome-vpn.com/?ref=ABCDEF23');
  });
});

describe('telegramReferralLink', () => {
  it('opens the bot with the code as the start payload', () => {
    expect(telegramReferralLink({ botUsername: 'GnomeVpnBot', code: 'ABCDEF23' })).toBe('https://t.me/GnomeVpnBot?start=ref_ABCDEF23');
  });

  it('drops a leading at sign from the username', () => {
    expect(telegramReferralLink({ botUsername: '@GnomeVpnBot', code: 'ABCDEF23' })).toBe('https://t.me/GnomeVpnBot?start=ref_ABCDEF23');
  });

  it('offers no link when the bot is not configured', () => {
    expect(telegramReferralLink({ botUsername: '', code: 'ABCDEF23' })).toBeNull();
    expect(telegramReferralLink({ botUsername: '@', code: 'ABCDEF23' })).toBeNull();
  });
});

describe('referralCodeFromStart', () => {
  it('reads the code back out of the payload it built', () => {
    expect(referralCodeFromStart(telegramStartPayload('ABCDEF23'))).toBe('ABCDEF23');
  });

  it('normalises a lower-cased code', () => {
    expect(referralCodeFromStart('ref_abcdef23')).toBe('ABCDEF23');
  });

  it('ignores a payload that is not a referral', () => {
    expect(referralCodeFromStart('ABCDEF23')).toBeNull();
    expect(referralCodeFromStart('')).toBeNull();
  });

  it('ignores a referral payload with a malformed code', () => {
    expect(referralCodeFromStart('ref_')).toBeNull();
    expect(referralCodeFromStart('ref_NOPE')).toBeNull();
    expect(referralCodeFromStart('ref_ABCDEF23_extra')).toBeNull();
  });
});
