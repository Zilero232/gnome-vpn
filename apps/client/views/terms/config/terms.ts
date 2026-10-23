import { DEFAULT_DEVICE_LIMIT, giftDays, MAX_EXTRA_DEVICES, TRIAL_DAYS } from '@gnomevpn/schemas';

import { SITE } from '@/shared/config';

export const TERMS_UPDATED = '2026-10-23';

export const TERMS_SECTIONS = [
  { key: 'definitions', clauses: 13 },
  { key: 'subject', clauses: 4 },
  { key: 'acceptance', clauses: 3 },
  { key: 'service', clauses: 11 },
  { key: 'obligations', clauses: 6 },
  { key: 'payment', clauses: 7 },
  { key: 'autoRenewal', clauses: 9 },
  { key: 'trial', clauses: 4 },
  { key: 'refunds', clauses: 9 },
  { key: 'bonuses', clauses: 10 },
  { key: 'termination', clauses: 4 },
  { key: 'liability', clauses: 5 },
  { key: 'personalData', clauses: 3 },
  { key: 'changes', clauses: 4 },
  { key: 'law', clauses: 4 },
  { key: 'contacts', clauses: 2 }
] as const;

export const TERMS_VALUES = {
  email: SITE.email,
  site: new URL(SITE.url).host,
  trialDays: TRIAL_DAYS,
  deviceLimit: DEFAULT_DEVICE_LIMIT,
  maxExtraDevices: MAX_EXTRA_DEVICES,
  giftMonthDays: giftDays('monthly'),
  giftHalfYearDays: giftDays('halfYearly'),
  giftYearDays: giftDays('yearly')
} as const;

export const TERMS_SUMMARY = ['subscription', 'autoRenewal', 'refunds', 'devices', 'trial'] as const;

export type TermsSection = (typeof TERMS_SECTIONS)[number]['key'];
