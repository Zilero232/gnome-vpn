export const ADMIN_USER = {
  searchMaxLength: 120,
  extendMinDays: 1,
  extendMaxDays: 365,
  messageMaxLength: 3500,
  cardPayments: 50,
  cardInvited: 50
} as const;

export const ADMIN_USER_FILTERS = {
  autoRenew: ['on', 'off'],
  telegram: ['linked', 'unlinked'],
  email: ['verified', 'unverified', 'none'],
  defaultPeriod: 'all'
} as const;

export const ADMIN_MESSAGE_OUTCOMES = ['sent', 'notLinked', 'blocked', 'botOff', 'failed'] as const;

export const ADMIN_REDEMPTION_KINDS = ['discount', 'days', 'gift'] as const;
