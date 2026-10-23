export const ADMIN_PAGE = {
  size: 25,
  maxPage: 100_000
} as const;

export const ADMIN_ID = {
  maxLength: 64
} as const;

export const ADMIN_PERIODS = ['7d', '30d', '90d', '365d', 'all'] as const;

export const ADMIN_PERIOD_DAYS = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '365d': 365,
  all: null
} as const;

export const ADMIN_EXPORT = {
  maxRows: 10_000
} as const;
