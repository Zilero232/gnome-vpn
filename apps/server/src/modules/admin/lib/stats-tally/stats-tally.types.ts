import type { AdminOverview, PeriodKind, PlanId } from '@gnomevpn/schemas';

import type { StatusNodeRow } from '../../../status';

export type StatsSubscription = {
  plan: PlanId;
  period: PeriodKind;
  isAutoRenew: boolean;
};

export type SubscriptionTally = AdminOverview['subscriptions'];

export type TallyNode = Omit<StatusNodeRow, 'uptime'> & {
  isAvailable: boolean;
};

export type NodeTallyInput = {
  nodes: TallyNode[];
  now: Date;
};

export type TallyKeyInput = {
  node: TallyNode;
  now: Date;
};
