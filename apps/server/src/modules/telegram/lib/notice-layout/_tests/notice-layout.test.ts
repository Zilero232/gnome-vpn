import { describe, expect, it } from 'vitest';

import { noticeLayout } from '../notice-layout';

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
