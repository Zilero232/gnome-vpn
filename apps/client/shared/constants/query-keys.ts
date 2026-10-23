import type { AdminAnalyticsRange, AdminPaymentQuery, AdminUserQuery } from '@gnomevpn/schemas';

export const QUERY_KEYS = {
  subscriptionStatus: () => ['subscription-status'] as const,
  subscriptionLink: () => ['subscription-link'] as const,
  devices: () => ['devices'] as const,
  referrals: () => ['referrals'] as const,
  telegramStatus: () => ['telegram-status'] as const,
  telegramWidget: () => ['telegram-widget'] as const,
  wireguard: () => ['wireguard'] as const,
  authAccounts: () => ['auth-accounts'] as const,
  serverStatus: () => ['server-status'] as const,
  pendingDiscount: () => ['pending-discount'] as const,
  gifts: () => ['gifts'] as const,
  routingSettings: () => ['routing-settings'] as const,
  paymentMethods: () => ['payment-methods'] as const,
  adminSession: () => ['admin-session'] as const,
  admin: () => ['admin'] as const,
  adminOverview: () => ['admin', 'overview'] as const,
  adminAnalytics: (range: AdminAnalyticsRange) => ['admin', 'analytics', range] as const,
  adminUsers: (query: AdminUserQuery) => ['admin', 'users', query] as const,
  adminUser: (id: string) => ['admin', 'user', id] as const,
  adminPayments: (query: AdminPaymentQuery) => ['admin', 'payments', query] as const,
  adminCampaigns: (page: number) => ['admin', 'campaigns', page] as const,
  adminGifts: (page: number) => ['admin', 'gifts', page] as const,
  adminNodes: () => ['admin', 'nodes'] as const
};
