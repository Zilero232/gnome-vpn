import type { ClientRules } from './client-messages.types';

export const CLIENT_MESSAGES: ClientRules = {
  account: 'all',
  auth: 'all',
  common: 'all',
  devices: 'all',
  error: 'all',
  errors: 'all',
  faq: ['title', 'intro', 'groups', 'stillStuck', 'search'],
  footer: 'all',
  incy: 'all',
  landing: ['connect', 'phone', 'locations', 'inside'],
  nav: 'all',
  plans: 'all',
  referrals: 'all',
  setup: 'all',
  telegram: 'all',
  trial: 'all',
  validation: 'all',
  wireguard: 'all'
};

export const SERVER_ONLY_KEYS = ['meta'] as const;
