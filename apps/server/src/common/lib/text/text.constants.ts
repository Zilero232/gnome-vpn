export const COUNTRY_FLAG = {
  regionalIndicatorA: '🇦'.codePointAt(0) ?? 0,
  latinA: 'A'.charCodeAt(0),
  countryCode: /^[A-Z]{2}$/
} as const;

export const DEFAULT_PLURAL_LOCALE = 'ru-RU';
