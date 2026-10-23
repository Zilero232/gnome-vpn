import { SITE } from '@/shared/config';

export const CONSENT_UPDATED = '2026-10-23';

export const CONSENT_SECTIONS = [
  { key: 'operator', items: 0 },
  { key: 'data', items: 9 },
  { key: 'purposes', items: 6 },
  { key: 'actions', items: 0 },
  { key: 'transfer', items: 0 },
  { key: 'term', items: 0 },
  { key: 'withdrawal', items: 0 },
  { key: 'form', items: 0 }
] as const;

export const CONSENT_VALUES = {
  email: SITE.email,
  site: new URL(SITE.url).host
} as const;

export type ConsentSectionKey = (typeof CONSENT_SECTIONS)[number]['key'];
