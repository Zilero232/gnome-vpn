import { REFERRAL_REWARDS } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { isTelegramHtml } from '@/modules/telegram/shared/text';

import { inviteLine, noticeLayout } from '../notify.helpers';

const PROMPT = '🤝 Invite a friend';

describe('noticeLayout', () => {
  it('leaves a notice without an invite as it is', () => {
    expect(noticeLayout({ text: 'Paid', markup: 'main', prompt: null })).toEqual({ text: 'Paid', markup: 'main', followUp: null });
  });

  it('puts the invite under an inline notice and adds its button beside the others', () => {
    expect(noticeLayout({ text: 'New device', markup: ['devices'], prompt: PROMPT })).toEqual({
      text: `New device\n\n${PROMPT}`,
      markup: ['devices', 'invite'],
      followUp: null
    });
  });

  it('sends the invite as a second message when the notice carries the reply keyboard, which leaves no room for a button', () => {
    expect(noticeLayout({ text: 'Paid', markup: 'main', prompt: PROMPT })).toEqual({ text: 'Paid', markup: 'main', followUp: PROMPT });
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
