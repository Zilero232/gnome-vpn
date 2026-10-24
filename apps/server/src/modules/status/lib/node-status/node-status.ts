import type { NodeState, NodeStatus } from '@gnomevpn/schemas';

import { NODE_STATE, UPTIME_HISTORY } from '@gnomevpn/schemas';
import { isBefore } from 'date-fns';
import { clamp, groupBy, isNonNullish, isNullish, sumBy } from 'remeda';

import { dayKey, dayKeys, utcDay, windowStart } from '@/common/lib';
import { nodeProtocols } from '@/modules/peers';

import type { NodeStatusInput, PassedCheckInput, ProbeStamps, UptimeHistory, UptimeHistoryInput, UptimeRow } from './node-status.types';

import { NODE_DOWN } from './node-status.constants';

const minuteRatio = (rows: UptimeRow[]): number | null => {
  const checked = sumBy(rows, (row) => row.checkedMinutes);

  return checked > 0 ? clamp(sumBy(rows, (row) => row.upMinutes) / checked, { min: 0, max: 1 }) : null;
};

export const nodeState = ({ lastHealthyAt, lastCheckedAt, isOverloaded }: ProbeStamps): NodeState => {
  if (isNullish(lastHealthyAt)) {
    return NODE_STATE.down;
  }

  const failingForMs = isNullish(lastCheckedAt) ? 0 : lastCheckedAt.getTime() - lastHealthyAt.getTime();

  if (failingForMs > (NODE_DOWN.statusPage.failedChecks - 1) * NODE_DOWN.statusPage.checkIntervalMs) {
    return NODE_STATE.down;
  }

  return failingForMs > 0 || isOverloaded ? NODE_STATE.degraded : NODE_STATE.up;
};

export const passedCheck = ({ lastHealthyAt, checkedAt }: PassedCheckInput): boolean =>
  isNonNullish(lastHealthyAt) && !isBefore(lastHealthyAt, checkedAt);

export const historyStart = (today: Date): Date => windowStart({ now: today, days: UPTIME_HISTORY.days });

export const uptimeHistory = ({ rows, today }: UptimeHistoryInput): UptimeHistory => {
  const byDay = groupBy(rows, (row) => dayKey(row.day));
  const dates = dayKeys({ start: historyStart(today), days: UPTIME_HISTORY.days });

  return {
    days: dates.map((date) => ({ date, uptime: minuteRatio(byDay[date] ?? []) })),
    uptime: minuteRatio(dates.flatMap((date) => byDay[date] ?? []))
  };
};

export const nodeStatus = ({ node, now }: NodeStatusInput): NodeStatus => ({
  countryCode: node.countryCode,
  protocols: nodeProtocols(node),
  state: nodeState(node),
  checkedAt: node.lastCheckedAt?.toISOString() ?? null,
  ...uptimeHistory({ rows: node.uptime, today: utcDay(now) })
});
