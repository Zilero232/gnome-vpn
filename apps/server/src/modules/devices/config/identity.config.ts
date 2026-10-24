import { WIREGUARD_DEVICE_APP } from '@gnomevpn/schemas';

export const DEVICE_HEADER = {
  hwid: 'x-hwid',
  androidId: 'x-device-id',
  platform: 'x-device-os',
  osVersion: 'x-ver-os',
  model: 'x-device-model',
  userAgent: 'user-agent'
} as const;

export const DEVICE_KEY = {
  hwid: 'hwid:',
  app: 'app:',
  unknownApp: 'unknown',
  incyApp: 'INCY',
  wireguard: 'wg:',
  wireguardApp: WIREGUARD_DEVICE_APP
} as const;

export const DEVICE_FIELD = {
  maxLength: 64,
  appMaxLength: 32,
  hwid: /^[0-9A-Z-]{8,64}$/i,
  incyAgent: /^INCY\/(?<version>[^/\s]+)\/(?<platform>[^/\s]+)/i,
  agentName: /^([A-Z][\w.-]*)/i
} as const;

export const DEVICE_TITLE = {
  separator: ' · ',
  listSeparator: ', ',
  unknown: '?'
} as const;
