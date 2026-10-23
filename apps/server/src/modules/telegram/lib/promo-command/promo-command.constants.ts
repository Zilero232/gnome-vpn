export const PROMO_COMMAND = {
  stop: 'off',
  percent: /^(\d+)%$/u,
  days: /^\+?(\d+)d$/iu,
  uses: /^uses=(\d+)$/iu,
  until: /^until=(\d{4}-\d{2}-\d{2})$/iu,
  dateFormat: 'yyyy-MM-dd',
  dayEnd: 'T23:59:59+03:00',
  separator: /\s+/u
} as const;
