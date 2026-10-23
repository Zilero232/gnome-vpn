import type { ClientRules } from './client-messages.types';

export const CLIENT_MESSAGES: ClientRules = {
  account: 'all',
  auth: 'all',
  common: 'all',
  devices: 'all',
  error: 'all',
  errors: 'all',
  faq: ['title', 'intro', 'groups', 'stillStuck', 'search', 'links'],
  footer: 'all',
  gifts: 'all',
  incy: 'all',
  landing: ['connect', 'phone', 'locations', 'inside'],
  nav: 'all',
  payments: 'all',
  plans: 'all',
  referrals: 'all',
  routing: 'all',
  setup: 'all',
  status: ['states', 'protocols', 'nodes', 'check'],
  telegram: 'all',
  terms: ['notes'],
  trial: 'all',
  unsubscribe: 'all',
  validation: 'all',
  wireguard: 'all'
};

export const SERVER_ONLY_KEYS = ['meta'] as const;

export const ROUTE_MESSAGES = ['admin'] as const;
