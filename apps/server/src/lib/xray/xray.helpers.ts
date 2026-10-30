import { subSeconds } from 'date-fns';
import { randomBytes } from 'node:crypto';
import { isNullish, isString } from 'remeda';

import { AppServiceUnavailableException } from '@/common/exceptions';

import type {
  InboundInput,
  InboundPayload,
  PanelInbound,
  PanelLastOnline,
  PanelOnlines,
  PanelResourceUsage,
  ReadSettingsInput,
  RequireInboundInput,
  StartedAtInput,
  WireguardClient
} from './xray.types';

import { AUTH_BYTES, INBOUND } from './xray.constants';
import { PANEL_SCHEMA } from './xray.schemas';

const parsedJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

const stringified = (value: unknown): string => (isNullish(value) ? '' : JSON.stringify(value));

export const generateAuth = (): string => randomBytes(AUTH_BYTES).toString('hex');

export const startedAt = ({ uptimeSeconds, now }: StartedAtInput): Date | null =>
  isNullish(uptimeSeconds) || uptimeSeconds <= 0 ? null : subSeconds(now, uptimeSeconds);

export const usageRatio = (usage: PanelResourceUsage): number | null => {
  if (isNullish(usage?.current) || isNullish(usage.total) || usage.total === 0) {
    return null;
  }

  return usage.current / usage.total;
};

export const readSettings = <T>({ inbound, schema }: ReadSettingsInput<T>): T | null => {
  const parsed = schema.safeParse(isString(inbound.settings) ? parsedJson(inbound.settings) : inbound.settings);

  return parsed.success ? parsed.data : null;
};

export const readClients = (inbound: PanelInbound): unknown[] | null => {
  const settings = readSettings({ inbound, schema: PANEL_SCHEMA.settings });

  if (isNullish(settings)) {
    return null;
  }

  if (isString(inbound.settings)) {
    return settings.clients ?? [];
  }

  return settings.clients ?? null;
};

export const requireInbound = ({ inbounds, remark }: RequireInboundInput): PanelInbound => {
  const inbound = inbounds.find((candidate) => candidate.remark === remark);

  if (isNullish(inbound)) {
    throw new AppServiceUnavailableException('NODE_UNAVAILABLE', `no inbound remarked ${remark}`);
  }

  return inbound;
};

export const inboundPayload = ({ inbound, remark }: InboundInput): InboundPayload => ({
  ...inbound,
  remark,
  enable: true,
  settings: JSON.stringify(inbound.settings),
  streamSettings: stringified(inbound.streamSettings),
  sniffing: stringified(inbound.sniffing)
});

export const collectOnlineEmails = (payload: PanelOnlines): Set<string> | null => {
  if (isNullish(payload)) {
    return null;
  }

  if (Array.isArray(payload)) {
    return new Set(payload);
  }

  return new Set(Object.values(payload).flat());
};

export const collectLastOnline = (payload: PanelLastOnline): Map<string, Date> =>
  new Map(
    Object.entries(payload ?? {})
      .filter(([, at]) => at > 0)
      .map(([email, at]) => [email, new Date(at)])
  );

export const hostOf = (cidr: string): string => cidr.split('/')[0] ?? cidr;

export const addressOf = (client: WireguardClient | undefined): string | null => {
  const [first] = client?.allowedIPs ?? [];

  return first ? hostOf(first) : null;
};

export const hostRoute = (address: string): string => `${hostOf(address)}${INBOUND.wireguard.hostMask}`;
