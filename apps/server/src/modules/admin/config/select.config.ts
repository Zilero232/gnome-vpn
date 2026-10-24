import { STATUS_NODE_SELECT } from '@/modules/status';

export const USER_ROW_SELECT = {
  id: true,
  email: true,
  emailVerified: true,
  createdAt: true,
  subscription: { select: { plan: true, currentPeriodEnd: true, trialStartedAt: true } },
  telegramAccount: { select: { telegramId: true, username: true } },
  _count: { select: { devices: true } }
} as const;

export const USER_ORDER = [{ createdAt: 'desc' }, { id: 'desc' }] as const;

export const PAYMENT_ROW_SELECT = {
  id: true,
  yookassaPaymentId: true,
  amount: true,
  status: true,
  kind: true,
  plan: true,
  isAutoCharge: true,
  extraDevices: true,
  discountPercent: true,
  createdAt: true,
  refundRequestedAt: true,
  user: { select: { id: true, email: true } },
  promoCode: { select: { code: true } }
} as const;

export const PAYMENT_ORDER = [{ createdAt: 'desc' }, { id: 'desc' }] as const;

export const NODE_ORDER = [{ displayOrder: 'asc' }, { createdAt: 'asc' }] as const;

export const STATS_NODE_SELECT = {
  ...STATUS_NODE_SELECT,
  id: true,
  country: true,
  city: true,
  isAvailable: true,
  createdAt: true
} as const;

export const ADMIN_NODE_SELECT = {
  ...STATS_NODE_SELECT,
  host: true,
  port: true,
  displayOrder: true
} as const;

export const GIFT_ROW_SELECT = {
  id: true,
  code: true,
  plan: true,
  days: true,
  createdAt: true,
  expiresAt: true,
  buyer: { select: { id: true, email: true } },
  redemptions: {
    select: { createdAt: true, user: { select: { id: true, email: true } } },
    orderBy: { createdAt: 'asc' },
    take: 1
  }
} as const;

export const CAMPAIGN_ROW_SELECT = {
  id: true,
  code: true,
  kind: true,
  percent: true,
  days: true,
  maxUses: true,
  expiresAt: true,
  createdAt: true,
  _count: { select: { redemptions: true } }
} as const;

export const USER_CARD_SELECT = {
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
} as const;

export const INVITED_SELECT = {
  createdAt: true,
  rewardedAt: true,
  referrerDays: true,
  referred: { select: { id: true, email: true } }
} as const;

export const REDEMPTION_SELECT = {
  createdAt: true,
  consumedAt: true,
  replacedAt: true,
  promoCode: { select: { code: true, kind: true, percent: true, days: true } }
} as const;
