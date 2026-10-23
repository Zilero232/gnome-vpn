import type { AdminAnalytics } from '@gnomevpn/schemas';

export type ReferralsBlockProps = {
  referrals: AdminAnalytics['referrals'];
  period: number;
  isFaded: boolean;
};
