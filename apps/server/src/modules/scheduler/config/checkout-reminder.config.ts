export const CHECKOUT_REMINDER = {
  afterMinutes: 60,
  lookbackHours: 24,
  userGapHours: 24,
  kinds: ['subscription', 'gift'],
  statuses: ['pending', 'canceled'],
  notice: {
    subscription: 'checkoutAbandoned',
    gift: 'giftCheckoutAbandoned'
  }
} as const;
