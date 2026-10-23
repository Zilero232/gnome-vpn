import type { AdminUserCard } from '@gnomevpn/schemas';

export type SubscriptionSectionProps = {
  userId: string;
  subscription: AdminUserCard['subscription'];
};
