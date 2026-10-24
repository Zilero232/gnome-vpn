import { PLANS } from '@gnomevpn/schemas';
import { subMinutes } from 'date-fns';
import { sumBy } from 'remeda';
import { describe, expect, it } from 'vitest';

import { nodeStatus } from '@/modules/status';

import type { StatsSubscription, TallyNode } from '../stats-tally.types';

import { nodeTally, subscriptionTally } from '../stats-tally';

const NOW = new Date('2026-10-23T12:00:00.000Z');

const [first, second] = PLANS;

const rows: StatsSubscription[] = [
  { plan: first.id, period: 'paid', isAutoRenew: true },
  { plan: first.id, period: 'paid', isAutoRenew: false },
  { plan: second.id, period: 'paid', isAutoRenew: true },
  { plan: first.id, period: 'trial', isAutoRenew: true }
];

const node = (patch: Partial<TallyNode>): TallyNode => ({
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
