import type { AdminAnalytics } from '@gnomevpn/schemas';

export type RevenueView = 'kind' | 'plan';

export type RevenueSlicesInput = Pick<AdminAnalytics, 'revenueByKind' | 'revenueByPlan'> & {
  view: RevenueView;
};

export type RevenueSlice = {
  key: string;
  amount: number;
  count: number;
};

export type RevenueTotal = {
  amount: number;
  count: number;
};
