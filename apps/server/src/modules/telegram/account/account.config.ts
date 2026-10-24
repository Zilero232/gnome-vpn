export const LINK_CODE = {
  ttlMinutes: 15
} as const;

export const WEB_LOGIN = {
  bytes: 32,
  ttlMinutes: 10,
  path: '/telegram',
  throttle: { ttl: 60_000, limit: 10 }
} as const;

export const WIDGET_AUTH = {
  hashField: 'hash',
  separator: '\n',
  maxAgeSeconds: 86_400,
  maxFields: 16,
  telegramId: /^\d{1,19}$/u
} as const;
