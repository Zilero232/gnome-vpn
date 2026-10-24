import type { AdminUserFilter } from '@gnomevpn/schemas';

import { PLACEHOLDER_EMAIL } from '@gnomevpn/schemas';
import { isNonNullish } from 'remeda';
import { match } from 'ts-pattern';

import type { Prisma } from '@/generated';

import type { UserFilterWhereInput } from './user-filter.types';

import { periodStart } from '../period-start';

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
