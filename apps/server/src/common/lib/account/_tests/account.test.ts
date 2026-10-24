import { telegramPlaceholderEmail } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { hasConfirmedEmail } from '../account';

describe('hasConfirmedEmail', () => {
  it('passes a verified address', () => {
    expect(hasConfirmedEmail({ email: 'reader@example.com', emailVerified: true })).toBe(true);
  });

  it('holds back an address nobody has verified yet', () => {
    expect(hasConfirmedEmail({ email: 'reader@example.com', emailVerified: false })).toBe(false);
  });

  it('passes a Telegram account, whose placeholder address has nothing to verify', () => {
    expect(hasConfirmedEmail({ email: telegramPlaceholderEmail(123n), emailVerified: false })).toBe(true);
  });
});
