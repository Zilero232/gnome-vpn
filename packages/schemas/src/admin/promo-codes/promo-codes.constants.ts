export const ADMIN_CAMPAIGN_STATES = ['active', 'expired', 'usedUp'] as const;

export const ADMIN_GIFT_STATES = ['waiting', 'redeemed', 'revoked'] as const;

export const ADMIN_GIFT = {
  visibleTail: 4,
  mask: '•'
} as const;
