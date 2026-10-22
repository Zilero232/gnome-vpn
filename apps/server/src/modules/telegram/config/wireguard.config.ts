import type { ApiErrorCode } from '@gnomevpn/schemas';

import type { BotText } from '../telegram.types';

export const WIREGUARD_KINDS = [
  { kind: 'phone', icon: '📱', name: 'wireguardPhone', how: 'wireguardHowPhone' },
  { kind: 'computer', icon: '💻', name: 'wireguardComputer', how: 'wireguardHowComputer' },
  { kind: 'router', icon: '📡', name: 'wireguardRouter', how: 'wireguardHowRouter' }
] as const satisfies readonly { kind: string; icon: string; name: keyof BotText; how: keyof BotText }[];

export const WIREGUARD_REFUSALS: Partial<Record<ApiErrorCode, keyof BotText>> = {
  DEVICE_LIMIT_REACHED: 'wireguardFull',
  DEVICE_NOT_FOUND: 'deviceGone',
  NODE_NOT_FOUND: 'wireguardUnavailable',
  NODE_UNAVAILABLE: 'wireguardUnavailable'
};
