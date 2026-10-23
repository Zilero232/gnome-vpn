export const PERSONAL_DATA_CONSENT_VERSION = '2026-10-24';

export const MARKETING_CONSENT_VERSION = '2026-10-24';

export const CONSENT_KINDS = ['personalData', 'marketing'] as const;

export const CONSENT_SOURCES = ['signup', 'telegram', 'account', 'bot', 'email'] as const;

export const UNSUBSCRIBE_OUTCOMES = ['unsubscribed', 'invalid'] as const;

export const CONSENT_INPUT = {
  marketingSources: ['signup', 'account'],
  personalDataSources: ['signup'],
  versionPattern: /^\d{4}-\d{2}-\d{2}$/u,
  tokenMaxLength: 256
} as const;
