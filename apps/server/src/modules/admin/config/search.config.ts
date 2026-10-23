export const USER_SEARCH = {
  uuid: /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu,
  digits: /^\d{1,19}$/u,
  usernamePrefix: '@',
  maxTelegramId: 9_223_372_036_854_775_807n
} as const;
