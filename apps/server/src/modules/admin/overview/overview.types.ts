import type { AdminDay, AdminOverview, PeriodKind, PlanId } from '@gnomevpn/schemas';

import type { Prisma } from '@/generated';

import type { ROW_SELECT } from '../shared/admin.config';

export type StatsNodeRow = Prisma.NodeGetPayload<{ select: typeof ROW_SELECT.node }>;

export type SubscriptionTally = AdminOverview['subscriptions'];

export type StatsSnapshot = {
  users: {
    total: number;
    day: number;
    week: number;
  };
  subscriptions: SubscriptionTally;
  payments: {
    days: number;
    count: number;
    amount: number;
  };
  devices: number;
  chats: number;
  nodes: StatsNodeRow[];
};

export type StatsSubscription = {
  plan: PlanId;
  period: PeriodKind;
  isAutoRenew: boolean;
};

export type NodeTallyInput = {
  nodes: StatsNodeRow[];
  now: Date;
};

export type ShareRow = {
  label: string | null;
  count: number;
};

export type FoldSharesInput = {
  rows: ShareRow[];
  limit: number;
};

export type DayRow = {
  day: string;
  value: number;
};

export type BuildDaysInput = {
  keys: string[];
  series: Record<Exclude<keyof AdminDay, 'date'>, DayRow[]>;
};

export type PaymentDayRow = {
  day: string;
  payments: number;
  revenue: number;
};

export type ConversionRow = {
  trials: number;
  converted: number;
};

export type CheckoutReminderRow = {
  sent: number;
  recovered: number;
};
