import { telegramPlaceholderEmail } from '@gnomevpn/schemas';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { normaliseEmail, trialIdentities } from '../trial-identity';

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

describe('normaliseEmail', () => {
  it('lowercases and trims', () => {
    expect(normaliseEmail('  Reader@Example.COM ')).toBe('reader@example.com');
  });

  it('drops a plus tag', () => {
    expect(normaliseEmail('reader+trial2@example.com')).toBe('reader@example.com');
  });

  it('drops the dots of a Gmail address and folds googlemail into gmail', () => {
    expect(normaliseEmail('Re.Ad.Er+x@googlemail.com')).toBe('reader@gmail.com');
  });

  it('keeps the dots of any other domain', () => {
    expect(normaliseEmail('re.ader@example.com')).toBe('re.ader@example.com');
  });
});

describe('trialIdentities', () => {
  it('hashes the normalised email and the Telegram id', () => {
    expect(trialIdentities({ email: 'Reader+x@example.com', telegramId: 42n })).toEqual([sha256('email:reader@example.com'), sha256('telegram:42')]);
  });

  it('skips a placeholder email, which only stands in for the Telegram id', () => {
    expect(trialIdentities({ email: telegramPlaceholderEmail(42n), telegramId: 42n })).toEqual([sha256('telegram:42')]);
  });

  it('returns nothing without an identity', () => {
    expect(trialIdentities({ email: null, telegramId: null })).toEqual([]);
  });
});
