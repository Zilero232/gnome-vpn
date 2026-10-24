import type { AdminUser, AdminUserFilter } from '@gnomevpn/schemas';

import { isPlaceholderEmail, PLACEHOLDER_EMAIL } from '@gnomevpn/schemas';
import { isNonNullish } from 'remeda';
import { match } from 'ts-pattern';

import type { Prisma } from '@/generated';

import { periodKind } from '@/modules/subscription';

import type { UserFilterWhereInput, UserRow, UserSearch } from './users.types';

import { isoOrNull, periodStart } from '../shared/listing.helpers';
import { USER_SEARCH } from './users.config';

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

const placeholderEmail = { email: { endsWith: PLACEHOLDER_EMAIL.domain, mode: 'insensitive' as const } };

export const needsTrialUserIds = ({ access, plan, autoRenew }: AdminUserFilter): boolean =>
  isNonNullish(access) || isNonNullish(plan) || isNonNullish(autoRenew);

export const userFilterWhere = ({ filter, now, trialUserIds }: UserFilterWhereInput): Prisma.UserWhereInput[] => {
  const start = periodStart({ period: filter.period, now });
  const active = { currentPeriodEnd: { gt: now } };
  const paid = { subscription: { is: active }, id: { notIn: trialUserIds } };

  const access = match(filter.access)
    .with('paid', () => paid)
    .with('trial', () => ({ id: { in: trialUserIds } }))
    .with('none', () => ({
      OR: [{ subscription: { is: null } }, { subscription: { is: { OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { lte: now } }] } } }]
    }))
    .with(undefined, () => null)
    .exhaustive();

  const autoRenew = match(filter.autoRenew)
    .with('on', () => ({ ...paid, subscription: { is: { ...active, savedCardId: { not: null }, cancelAtPeriodEnd: false } } }))
    .with('off', () => ({ ...paid, subscription: { is: { ...active, OR: [{ savedCardId: null }, { cancelAtPeriodEnd: true }] } } }))
    .with(undefined, () => null)
    .exhaustive();

  const telegram = match(filter.telegram)
    .with('linked', () => ({ telegramAccount: { isNot: null } }))
    .with('unlinked', () => ({ telegramAccount: { is: null } }))
    .with(undefined, () => null)
    .exhaustive();

  const email = match(filter.email)
    .with('verified', () => ({ emailVerified: true, NOT: placeholderEmail }))
    .with('unverified', () => ({ emailVerified: false, NOT: placeholderEmail }))
    .with('none', () => placeholderEmail)
    .with(undefined, () => null)
    .exhaustive();

  const parts: (Prisma.UserWhereInput | null)[] = [
    access,
    isNonNullish(filter.plan) ? { ...paid, subscription: { is: { ...active, plan: filter.plan } } } : null,
    autoRenew,
    telegram,
    email,
    isNonNullish(start) ? { createdAt: { gte: start } } : null
  ];

  return parts.filter(isNonNullish);
};

export const userView = (row: UserRow): AdminUser => ({
  id: row.id,
  email: row.email,
  hasEmail: !isPlaceholderEmail(row.email),
  emailVerified: row.emailVerified,
  createdAt: row.createdAt.toISOString(),
  access: periodKind(row.subscription),
  currentPeriodEnd: isoOrNull(row.subscription?.currentPeriodEnd),
  plan: row.subscription?.plan ?? null,
  devices: row._count.devices,
  telegram: row.telegramAccount ? { id: row.telegramAccount.telegramId.toString(), username: row.telegramAccount.username } : null
});
