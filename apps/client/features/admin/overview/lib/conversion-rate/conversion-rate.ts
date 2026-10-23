import type { AdminAnalytics } from '@gnomevpn/schemas';

export const conversionRate = ({ trials, converted }: AdminAnalytics['conversion']): number | null =>
  trials > 0 ? Math.min(converted / trials, 1) : null;
