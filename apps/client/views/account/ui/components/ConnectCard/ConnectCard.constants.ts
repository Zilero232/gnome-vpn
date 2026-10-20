import { ACCOUNT_TAB } from '@/shared/constants';

export const CONNECT_WAY_HASH = {
  incy: ACCOUNT_TAB.connect,
  wireguard: ACCOUNT_TAB.wireguard
} as const;

export const CONNECT_WAY_BY_HASH = new Map<string, keyof typeof CONNECT_WAY_HASH>([
  [ACCOUNT_TAB.connect, 'incy'],
  [ACCOUNT_TAB.app, 'incy'],
  [ACCOUNT_TAB.wireguard, 'wireguard']
]);
