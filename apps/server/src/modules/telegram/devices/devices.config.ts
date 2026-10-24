import type { ApiErrorCode, ClientId } from '@gnomevpn/schemas';

import type { WireguardKind } from '../shared/callback-data';
import type { BotText } from '../telegram.types';
import type { WireguardKindCopy } from './devices.types';

export const DEVICE_CHOICES = [1, 2, 3] as const;

export const WIREGUARD = {
  kinds: {
    phone: { icon: '📱', name: 'wireguardPhone', how: 'wireguardHowPhone' },
    computer: { icon: '💻', name: 'wireguardComputer', how: 'wireguardHowComputer' },
    router: { icon: '📡', name: 'wireguardRouter', how: 'wireguardHowRouter' }
  } satisfies Record<WireguardKind, WireguardKindCopy>,
  refusals: {
    DEVICE_LIMIT_REACHED: 'wireguardFull',
    DEVICE_NOT_FOUND: 'deviceGone',
    NODE_NOT_FOUND: 'wireguardUnavailable',
    NODE_UNAVAILABLE: 'wireguardUnavailable'
  } satisfies Partial<Record<ApiErrorCode, keyof BotText>>,
  firstSuffix: 2
} as const;

export const CLIENT = {
  labels: {
    incy: 'INCY',
    hiddify: 'Hiddify',
    v2rayng: 'v2rayNG',
    clashMeta: 'Clash Meta',
    streisand: 'Streisand',
    nekobox: 'NekoBox'
  } satisfies Record<ClientId, string>,
  paste: {
    incy: 'appsPasteIncy',
    hiddify: 'appsPasteHiddify',
    v2rayng: 'appsPasteV2rayng',
    clashMeta: 'appsPasteClashMeta',
    streisand: 'appsPasteStreisand',
    nekobox: 'appsPasteNekobox'
  } satisfies Record<ClientId, keyof BotText>,
  recommendedMark: '⭐'
} as const;
