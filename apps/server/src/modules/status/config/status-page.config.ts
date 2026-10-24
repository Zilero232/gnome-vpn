import { milliseconds } from 'date-fns';

import type { Prisma } from '@/generated';

export const STATUS_PAGE = {
  cacheTtlMs: milliseconds({ seconds: 30 }),
  uptimeRetentionDays: 90
} as const;

export const STATUS_NODE_SELECT = {
  countryCode: true,
  realityPublicKey: true,
  realityShortId: true,
  wgPublicKey: true,
  lastHealthyAt: true,
  lastCheckedAt: true,
  isOverloaded: true
} as const satisfies Prisma.NodeSelect;

export const STATUS_NODE_ORDER = [{ displayOrder: 'asc' }, { createdAt: 'asc' }] as const;

export const UPTIME_ROW_SELECT = {
  day: true,
  checkedMinutes: true,
  upMinutes: true
} as const satisfies Prisma.NodeUptimeSelect;

export const UPTIME_NODE_SELECT = {
  id: true,
  lastHealthyAt: true
} as const satisfies Prisma.NodeSelect;
