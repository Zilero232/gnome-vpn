import { describe, expect, it } from 'vitest';

import { unwrapAuth } from '../unwrap-auth';

describe('unwrapAuth', () => {
  it('hands back the data of a successful call', () => {
    expect(unwrapAuth({ result: { data: 42, error: null }, fallbackKey: 'errors.signInFailed' })).toBe(42);
  });

  it('names a rate limit as one, whatever code the server sent with it', () => {
    expect(() => unwrapAuth({ result: { data: null, error: { status: 429 } }, fallbackKey: 'errors.signInFailed' })).toThrow(
      'errors.tooManyRequests'
    );
  });

  it('falls back when the error carries nothing it knows', () => {
    expect(() => unwrapAuth({ result: { data: null, error: { status: 500 } }, fallbackKey: 'errors.signInFailed' })).toThrow('errors.signInFailed');
  });
});
