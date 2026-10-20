import type { SubscriptionStatus } from '@gnomevpn/schemas';

export type RenewPanelProps = {
  subscription: SubscriptionStatus;
  hasChargeFailed?: boolean;
};
