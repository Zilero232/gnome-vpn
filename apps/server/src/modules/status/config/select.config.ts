export const UPTIME_ROW_SELECT = {
  day: true,
  checkedMinutes: true,
  upMinutes: true
} as const;

export const STATUS_NODE_SELECT = {
  countryCode: true,
  realityPublicKey: true,
  realityShortId: true,
  wgPublicKey: true,
  lastHealthyAt: true,
  lastCheckedAt: true,
  isOverloaded: true
} as const;

export const STATUS_NODE_ORDER = [{ displayOrder: 'asc' }, { createdAt: 'asc' }] as const;

export const UPTIME_NODE_SELECT = {
  id: true,
  lastHealthyAt: true
} as const;

export const ADDRESS_NODE_SELECT = {
  id: true,
  host: true,
  countryCode: true
} as const;
