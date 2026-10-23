import { GrammyError } from 'grammy';
import { describe, expect, it } from 'vitest';

import { DIRECT_MESSAGE } from '../../../config';
import { failedDelivery } from '../direct-message';

const telegramError = (code: number) =>
  new GrammyError('sendMessage failed', { ok: false, error_code: code, description: 'Forbidden: bot was blocked by the user' }, 'sendMessage', {});

describe('failedDelivery', () => {
  it('reads a forbidden answer as a chat that blocked the bot', () => {
    expect(failedDelivery(telegramError(DIRECT_MESSAGE.blockedCode))).toBe('blocked');
  });

  it('reads any other telegram error as a failure', () => {
    expect(failedDelivery(telegramError(400))).toBe('failed');
  });

  it('reads a network error as a failure', () => {
    expect(failedDelivery(new Error('socket hang up'))).toBe('failed');
  });
});
