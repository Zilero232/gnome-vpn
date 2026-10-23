import { describe, expect, it } from 'vitest';

import { USER_SEARCH } from '../../../config';
import { parseUserSearch, userSearchWhere } from '../user-search';

const USER_ID = '3f2b9c4e-8a1d-4c6b-9e7f-0a1b2c3d4e5f';

describe('parseUserSearch', () => {
  it('lists everyone for an empty or blank query', () => {
    expect(parseUserSearch('')).toEqual({ kind: 'all' });
    expect(parseUserSearch('   ')).toEqual({ kind: 'all' });
  });

  it('reads a uuid as a user id, whatever its case', () => {
    expect(parseUserSearch(` ${USER_ID.toUpperCase()} `)).toEqual({ kind: 'userId', id: USER_ID });
  });

  it('reads digits as a telegram id', () => {
    expect(parseUserSearch('123456789')).toEqual({ kind: 'telegramId', id: '123456789' });
  });

  it('falls back to text for digits a telegram id column cannot hold', () => {
    const tooLarge = (USER_SEARCH.maxTelegramId + 1n).toString();

    expect(parseUserSearch(tooLarge).kind).toBe('text');
  });

  it('reads @name as a telegram username without the at sign', () => {
    expect(parseUserSearch('@gnome_fan')).toEqual({ kind: 'username', username: 'gnome_fan' });
  });

  it('keeps a lone at sign as text rather than an empty username', () => {
    expect(parseUserSearch('@').kind).toBe('text');
  });

  it('treats anything else as text', () => {
    expect(parseUserSearch('ivan@mail')).toEqual({ kind: 'text', text: 'ivan@mail' });
  });
});

describe('userSearchWhere', () => {
  it('filters nothing for the full list', () => {
    expect(userSearchWhere({ kind: 'all' })).toEqual({});
  });

  it('matches text against the email, the name and the telegram username, ignoring case', () => {
    const where = userSearchWhere({ kind: 'text', text: 'ivan' });
    const conditions = JSON.stringify(where.OR);

    expect(where.OR).toHaveLength(3);
    expect(conditions).toContain('insensitive');
    expect(conditions).toContain('email');
    expect(conditions).toContain('telegramAccount');
  });

  it('compares a telegram id as a bigint', () => {
    const where = userSearchWhere({ kind: 'telegramId', id: '42' });

    expect(where.OR?.[0]).toEqual({ telegramAccount: { telegramId: 42n } });
  });
});
