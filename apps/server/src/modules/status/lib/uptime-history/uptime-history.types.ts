import type { UptimeDay } from '@gnomevpn/schemas';

export type UptimeRow = {
  day: Date;
  checkedMinutes: number;
  upMinutes: number;
};

export type UptimeHistoryInput = {
  rows: UptimeRow[];
  today: Date;
};

export type UptimeHistory = {
  days: UptimeDay[];
  uptime: number | null;
};
