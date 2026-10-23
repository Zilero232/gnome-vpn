import { describe, expect, it } from 'vitest';

import { readUnsubscribe, signUnsubscribe } from '../unsubscribe-token';

const SECRET = 'test-secret';
const USER_ID = 'k3Jq9vXc2LmN8pRt5WyZ1aBdEfGhIjKo';

describe('unsubscribe token', () => {
  it('reads back the account it was signed for', () => {
    expect(readUnsubscribe({ token: signUnsubscribe({ userId: USER_ID, secret: SECRET }), secret: SECRET })).toBe(USER_ID);
  });

  it('is the same every time, so every promotional email of an account carries one link', () => {
    expect(signUnsubscribe({ userId: USER_ID, secret: SECRET })).toBe(signUnsubscribe({ userId: USER_ID, secret: SECRET }));
  });

  it('refuses a token whose account was swapped, so nobody can unsubscribe someone else', () => {
    const token = signUnsubscribe({ userId: USER_ID, secret: SECRET });
    const signature = token.slice(token.lastIndexOf('.') + 1);

    expect(readUnsubscribe({ token: `another-user.${signature}`, secret: SECRET })).toBeNull();
  });

  it('refuses a token signed with another secret', () => {
    expect(readUnsubscribe({ token: signUnsubscribe({ userId: USER_ID, secret: 'other' }), secret: SECRET })).toBeNull();
  });

  it('refuses anything that is not shaped like a token', () => {
    for (const token of ['', '.', USER_ID, `.${USER_ID}`, `${USER_ID}.`]) {
      expect(readUnsubscribe({ token, secret: SECRET }), token).toBeNull();
    }
  });
});
