import type { AdminUser } from '@gnomevpn/schemas';

import type { Prisma } from '@/generated';

import type { CsvColumn } from '../shared/admin.types';

export const USER_ROW_SELECT = {
  id: true,
  email: true,
  emailVerified: true,
  createdAt: true,
  subscription: { select: { plan: true, currentPeriodEnd: true, trialStartedAt: true } },
  telegramAccount: { select: { telegramId: true, username: true } },
  _count: { select: { devices: true } }
} as const satisfies Prisma.UserSelect;

export const USER_CARD_SELECT = {
  user: {
    id: true,
    email: true,
    name: true,
    emailVerified: true,
    locale: true,
    createdAt: true,
    telegramAccount: { select: { telegramId: true, username: true, linkedAt: true, lastSeenAt: true } },
    subscription: {
      select: {
        plan: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        savedCardId: true,
        savedCardTitle: true,
        extraDevices: true,
        bonusDays: true,
        trialStartedAt: true
      }
    },
    subscriptionLink: { select: { createdAt: true, lastSeenAt: true, lastPlatform: true } },
    referralCode: { select: { code: true } },
    referredBy: { select: { createdAt: true, rewardedAt: true, friendDays: true, referrer: { select: { id: true, email: true } } } }
  } as const satisfies Prisma.UserSelect,
  invited: {
    createdAt: true,
    rewardedAt: true,
    referrerDays: true,
    referred: { select: { id: true, email: true } }
  } as const satisfies Prisma.ReferralSelect,
  redemption: {
    createdAt: true,
    consumedAt: true,
    replacedAt: true,
    promoCode: { select: { code: true, kind: true, percent: true, days: true } }
  } as const satisfies Prisma.PromoRedemptionSelect
} as const;

export const USER_SEARCH = {
  uuid: /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu,
  digits: /^\d{1,19}$/u,
  usernamePrefix: '@',
  maxTelegramId: 9_223_372_036_854_775_807n
} as const;

export const USER_EXPORT = {
  file: 'gnomevpn-users',
  columns: [
    { header: 'id', value: (user) => user.id },
    { header: 'email', value: (user) => (user.hasEmail ? user.email : null) },
    { header: 'email_verified', value: (user) => user.emailVerified },
    { header: 'created_at', value: (user) => user.createdAt },
    { header: 'access', value: (user) => user.access },
    { header: 'plan', value: (user) => user.plan },
    { header: 'period_end', value: (user) => user.currentPeriodEnd },
    { header: 'devices', value: (user) => user.devices },
    { header: 'telegram_id', value: (user) => user.telegram?.id ?? null },
    { header: 'telegram_username', value: (user) => user.telegram?.username ?? null }
  ] satisfies CsvColumn<AdminUser>[]
} as const;
