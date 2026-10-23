import { describe, expect, it } from 'vitest';

import { telegramHandle } from '../telegram-handle';

describe('telegramHandle', () => {
  it('names a chat by its @username when it has one', () => {
    expect(telegramHandle({ id: '42', username: 'gnome' })).toBe('@gnome');
  });

  it('falls back to the numeric id for a chat without a username', () => {
    expect(telegramHandle({ id: '42', username: null })).toBe('42');
  });
});
