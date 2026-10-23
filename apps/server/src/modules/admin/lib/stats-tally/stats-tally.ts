import type { AdminNodeTally, NodeState } from '@gnomevpn/schemas';

import { PLANS } from '@gnomevpn/schemas';

import type { NodeTallyInput, StatsSubscription, SubscriptionTally, TallyKeyInput } from './stats-tally.types';

import { nodeStatus } from '../../../status';

export const subscriptionTally = (rows: StatsSubscription[]): SubscriptionTally => {
  const paid = rows.filter((row) => row.period === 'paid');

  return {
    paid: PLANS.map(({ id }) => ({ plan: id, count: paid.filter((row) => row.plan === id).length })),
    trials: rows.filter((row) => row.period === 'trial').length,
    autoRenew: paid.filter((row) => row.isAutoRenew).length
  };
};

const tallyKey = ({ node, now }: TallyKeyInput): 'off' | NodeState =>
  node.isAvailable ? nodeStatus({ node: { ...node, uptime: [] }, now }).state : 'off';

export const nodeTally = ({ nodes, now }: NodeTallyInput): AdminNodeTally => {
  const tally: AdminNodeTally = { up: 0, degraded: 0, down: 0, off: 0 };

  for (const node of nodes) {
    tally[tallyKey({ node, now })] += 1;
  }

  return tally;
};
