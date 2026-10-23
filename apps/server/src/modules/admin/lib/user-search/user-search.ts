import { match } from 'ts-pattern';

import type { Prisma } from '../../../../../generated';
import type { UserSearch } from './user-search.types';

import { USER_SEARCH } from '../../config';

const isTelegramId = (value: string): boolean => USER_SEARCH.digits.test(value) && BigInt(value) <= USER_SEARCH.maxTelegramId;

export const parseUserSearch = (query: string): UserSearch => {
  const value = query.trim();

  if (value === '') {
    return { kind: 'all' };
  }

  if (USER_SEARCH.uuid.test(value)) {
    return { kind: 'userId', id: value.toLowerCase() };
  }

  if (isTelegramId(value)) {
    return { kind: 'telegramId', id: value };
  }

  const username = value.startsWith(USER_SEARCH.usernamePrefix) ? value.slice(USER_SEARCH.usernamePrefix.length).trim() : null;

  if (username) {
    return { kind: 'username', username };
  }

  return { kind: 'text', text: value };
};

const contains = (value: string) => ({ contains: value, mode: 'insensitive' as const });

export const userSearchWhere = (search: UserSearch): Prisma.UserWhereInput =>
  match(search)
    .with({ kind: 'all' }, () => ({}))
    .with({ kind: 'userId' }, ({ id }) => ({ id }))
    .with({ kind: 'telegramId' }, ({ id }) => ({ OR: [{ telegramAccount: { telegramId: BigInt(id) } }, { email: contains(id) }] }))
    .with({ kind: 'username' }, ({ username }) => ({ telegramAccount: { username: contains(username) } }))
    .with({ kind: 'text' }, ({ text }) => ({
      OR: [{ id: text }, { email: contains(text) }, { name: contains(text) }, { telegramAccount: { username: contains(text) } }]
    }))
    .exhaustive();
