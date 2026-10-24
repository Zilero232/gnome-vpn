import { isString } from 'remeda';

import { DEVICE_FIELD, DEVICE_HEADER, DEVICE_KEY } from '@/modules/devices/config';

import type { CleanedInput, DeviceHeaders, HeaderOfInput, IncyAgent } from './device-identity.types';

export const headerOf = ({ headers, name }: HeaderOfInput): string | null => {
  const value = headers[name];
  const first = Array.isArray(value) ? value[0] : value;

  return isString(first) ? first : null;
};

export const incyAgent = (userAgent: string): IncyAgent | null => {
  const groups = DEVICE_FIELD.incyAgent.exec(userAgent)?.groups;

  return groups?.version && groups.platform ? { version: groups.version, platform: groups.platform } : null;
};

export const cleaned = ({ value, maxLength = DEVICE_FIELD.maxLength }: CleanedInput): string | null => {
  const printable = value?.replaceAll(/\p{C}/gu, '').trim();

  return printable ? printable.slice(0, maxLength) : null;
};

export const hwidOf = (headers: DeviceHeaders): string | null => {
  const raw = cleaned({ value: headerOf({ headers, name: DEVICE_HEADER.hwid }) ?? headerOf({ headers, name: DEVICE_HEADER.androidId }) });

  return raw && DEVICE_FIELD.hwid.test(raw) ? raw.toUpperCase() : null;
};

export const appOf = (userAgent: string | null): string | null => {
  if (!userAgent) {
    return null;
  }

  if (incyAgent(userAgent)) {
    return DEVICE_KEY.incyApp;
  }

  return cleaned({ value: DEVICE_FIELD.agentName.exec(userAgent.trim())?.[1] ?? null, maxLength: DEVICE_FIELD.appMaxLength });
};

export const agentPlatformOf = (userAgent: string | null): string | null => cleaned({ value: incyAgent(userAgent ?? '')?.platform ?? null });
