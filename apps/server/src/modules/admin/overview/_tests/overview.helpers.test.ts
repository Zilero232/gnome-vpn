import { PLANS } from '@gnomevpn/schemas';
import { subMinutes } from 'date-fns';
import { sumBy } from 'remeda';
import { describe, expect, it } from 'vitest';

import { nodeStatus } from '@/modules/status';

import type { ShareRow, StatsNodeRow, StatsSubscription } from '../overview.types';

import { buildDays, foldShares, nodeTally, subscriptionTally } from '../overview.helpers';

const NOW = new Date('2026-10-23T12:00:00.000Z');

const [first, second] = PLANS;

const rows: StatsSubscription[] = [
  { plan: first.id, period: 'paid', isAutoRenew: true },
  { plan: first.id, period: 'paid', isAutoRenew: false },
  { plan: second.id, period: 'paid', isAutoRenew: true },
  { plan: first.id, period: 'trial', isAutoRenew: true }
];

const node = (patch: Partial<StatsNodeRow>): StatsNodeRow => ({
  id: 'node-1',
  country: 'Germany',
  city: null,
  createdAt: NOW,
  countryCode: 'DE',
  realityPublicKey: null,
  realityShortId: null,
  wgPublicKey: null,
  lastHealthyAt: NOW,
  lastCheckedAt: NOW,
  isOverloaded: false,
  isAvailable: true,
  ...patch
});

describe('subscriptionTally', () => {
  it('counts paid periods per plan, in the order the plans are sold', () => {
    const { paid } = subscriptionTally(rows);

    expect(paid.map((entry) => entry.plan)).toEqual(PLANS.map((plan) => plan.id));
    expect(paid.find((entry) => entry.plan === first.id)?.count).toBe(2);
    expect(paid.find((entry) => entry.plan === second.id)?.count).toBe(1);
  });

  it('keeps a trial out of the paid count', () => {
    const tally = subscriptionTally(rows);
    const paid = sumBy(tally.paid, (entry) => entry.count);

    expect(tally.trials).toBe(1);
    expect(paid + tally.trials).toBe(rows.length);
  });

  it('counts auto-renewal only where there is a paid period to renew', () => {
    expect(subscriptionTally(rows).autoRenew).toBe(rows.filter((row) => row.period === 'paid' && row.isAutoRenew).length);
  });
});

describe('nodeTally', () => {
  const nodes = [
    node({}),
    node({ countryCode: 'NL', isOverloaded: true }),
    node({ countryCode: 'FI', lastHealthyAt: null, lastCheckedAt: subMinutes(NOW, 1) }),
    node({ countryCode: 'PL', isAvailable: false })
  ];

  it('counts every node exactly once', () => {
    const tally = nodeTally({ nodes, now: NOW });

    expect(tally.up + tally.degraded + tally.down + tally.off).toBe(nodes.length);
  });

  it('counts a node out of rotation as off, whatever its probes say', () => {
    expect(nodeTally({ nodes, now: NOW }).off).toBe(nodes.filter((each) => !each.isAvailable).length);
  });

  it('files each node in rotation under the state the status page gives it', () => {
    const tally = nodeTally({ nodes, now: NOW });

    for (const state of ['up', 'degraded', 'down'] as const) {
      const expected = nodes.filter((each) => each.isAvailable && nodeStatus({ node: { ...each, uptime: [] }, now: NOW }).state === state);

      expect(tally[state]).toBe(expected.length);
    }
  });
});

const ROWS: ShareRow[] = [
  { label: 'android', count: 40 },
  { label: 'ios', count: 30 },
  { label: 'windows', count: 12 },
  { label: null, count: 9 },
  { label: 'macos', count: 5 },
  { label: 'linux', count: 2 }
];

describe('foldShares', () => {
  it('keeps the largest groups first and folds the tail into one other entry', () => {
    const limit = 3;
    const shares = foldShares({ rows: ROWS, limit });

    expect(shares).toHaveLength(limit + 1);
    expect(shares.slice(0, limit).map((share) => share.count)).toEqual([40, 30, 12]);
    expect(shares.at(-1)).toMatchObject({ isOther: true, label: null });
  });

  it('never loses a device in the fold', () => {
    const shares = foldShares({ rows: ROWS, limit: 2 });

    expect(sumBy(shares, (share) => share.count)).toBe(sumBy(ROWS, (row) => row.count));
  });

  it('adds no other entry when everything fits', () => {
    expect(foldShares({ rows: ROWS, limit: ROWS.length }).some((share) => share.isOther)).toBe(false);
  });

  it('keeps an unknown label as its own entry rather than calling it other', () => {
    const unknown = foldShares({ rows: ROWS, limit: ROWS.length }).find((share) => share.label === null);

    expect(unknown).toMatchObject({ isOther: false, count: 9 });
  });

  it('counts an empty label as unknown and merges it with the missing ones', () => {
    const shares = foldShares({
      rows: [
        { label: ' ', count: 1 },
        { label: null, count: 2 }
      ],
      limit: 5
    });

    expect(shares).toEqual([{ label: null, isOther: false, count: 3 }]);
  });
});

const NO_ROWS = { revenue: [], payments: [], signups: [], newPaid: [], trials: [] };

describe('buildDays', () => {
  it('zips every series onto the same day', () => {
    const keys = ['2026-10-22', '2026-10-23'];
    const day = '2026-10-23';

    const [, last] = buildDays({
      keys,
      series: {
        revenue: [{ day, value: 990 }],
        payments: [{ day, value: 1 }],
        signups: [{ day, value: 4 }],
        newPaid: [{ day, value: 1 }],
        trials: [{ day, value: 2 }]
      }
    });

    expect(last).toEqual({ date: day, revenue: 990, payments: 1, signups: 4, newPaid: 1, trials: 2 });
  });

  it('puts zero on a day the query skipped', () => {
    const keys = ['2026-10-21', '2026-10-22', '2026-10-23'];
    const days = buildDays({ keys, series: { ...NO_ROWS, signups: [{ day: '2026-10-23', value: 5 }] } });

    expect(days.map((entry) => entry.signups)).toEqual([0, 0, 5]);
  });

  it('drops a row outside the range', () => {
    const keys = ['2026-10-22', '2026-10-23'];
    const days = buildDays({ keys, series: { ...NO_ROWS, revenue: [{ day: '2026-09-01', value: 7 }] } });

    expect(days.every((entry) => entry.revenue === 0)).toBe(true);
  });
});
