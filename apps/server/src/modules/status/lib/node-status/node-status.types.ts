import type { UptimeDay } from '@gnomevpn/schemas';

import type { ProtocolNode } from '@/modules/peers';

export type ProbeStamps = {
  lastHealthyAt: Date | null;
  lastCheckedAt: Date | null;
  isOverloaded: boolean;
};

export type UptimeRow = {
  day: Date;
  checkedMinutes: number;
  upMinutes: number;
};

export type StatusNodeRow = ProtocolNode &
  ProbeStamps & {
    countryCode: string;
    uptime: UptimeRow[];
  };

export type NodeStatusInput = {
  node: StatusNodeRow;
  now: Date;
};

export type PassedCheckInput = {
  lastHealthyAt: Date | null;
  checkedAt: Date;
};

export type UptimeHistoryInput = {
  rows: UptimeRow[];
  today: Date;
};

export type UptimeHistory = {
  days: UptimeDay[];
  uptime: number | null;
};
