import type { AdminAnalytics } from '@gnomevpn/schemas';

export type RevenueCardProps = Pick<AdminAnalytics, 'revenueByKind' | 'revenueByPlan'> & {
  period: number;
  isFaded: boolean;
};
