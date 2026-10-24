import type { AdminDay, AdminNodeTally, AdminShare } from '@gnomevpn/schemas';

import { PLANS } from '@gnomevpn/schemas';
import { groupBy, mapValues, sortBy, sumBy } from 'remeda';

import { nodeStatus } from '@/modules/status';

import type { BuildDaysInput, FoldSharesInput, NodeTallyInput, ShareRow, StatsSubscription, SubscriptionTally } from './overview.types';

export const subscriptionTally = (rows: StatsSubscription[]): SubscriptionTally => {
  const paid = rows.filter((row) => row.period === 'paid');

  return {
    paid: PLANS.map(({ id }) => ({ plan: id, count: paid.filter((row) => row.plan === id).length })),
    trials: rows.filter((row) => row.period === 'trial').length,
    autoRenew: paid.filter((row) => row.isAutoRenew).length
  };
};

export const nodeTally = ({ nodes, now }: NodeTallyInput): AdminNodeTally => {
  const tally: AdminNodeTally = { up: 0, degraded: 0, down: 0, off: 0 };

  for (const node of nodes) {
    tally[node.isAvailable ? nodeStatus({ node: { ...node, uptime: [] }, now }).state : 'off'] += 1;
  }

  return tally;
};

const labelOf = (label: string | null): string | null => {
  const trimmed = label?.trim() ?? '';

  return trimmed === '' ? null : trimmed;
};

const merged = (rows: ShareRow[]): ShareRow[] =>
  Object.values(groupBy(rows, (row) => labelOf(row.label) ?? '')).map((group) => ({
    label: labelOf(group[0].label),
    count: sumBy(group, (row) => row.count)
  }));

export const foldShares = ({ rows, limit }: FoldSharesInput): AdminShare[] => {
  const sorted = sortBy(
    merged(rows).filter((row) => row.count > 0),
    [(row) => row.count, 'desc'],
    [(row) => row.label ?? '', 'asc']
  );

  const top = sorted.slice(0, limit).map((row) => ({ ...row, isOther: false }));
  const rest = sumBy(sorted.slice(limit), (row) => row.count);

  return rest > 0 ? [...top, { label: null, isOther: true, count: rest }] : top;
};

export const buildDays = ({ keys, series }: BuildDaysInput): AdminDay[] => {
  const byDay = mapValues(series, (rows) => new Map(rows.map((row) => [row.day, row.value])));

  return keys.map((date) => ({
    date,
    revenue: byDay.revenue.get(date) ?? 0,
    payments: byDay.payments.get(date) ?? 0,
    signups: byDay.signups.get(date) ?? 0,
    newPaid: byDay.newPaid.get(date) ?? 0,
    trials: byDay.trials.get(date) ?? 0
  }));
};
