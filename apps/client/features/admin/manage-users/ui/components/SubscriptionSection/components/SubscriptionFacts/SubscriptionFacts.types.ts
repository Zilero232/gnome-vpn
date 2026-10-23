import type { AdminUserCard } from '@gnomevpn/schemas';

export type SubscriptionFactsProps = {
  subscription: NonNullable<AdminUserCard['subscription']>;
};
