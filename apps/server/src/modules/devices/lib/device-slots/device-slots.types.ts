import type { SubscriptionPeriod } from '../../../../common/lib';

export type SlotDevice = {
  id: string;
  createdAt: Date;
};

export type SlotHoldersInput = {
  devices: SlotDevice[];
  limit: number;
};

export type GraceDeviceLimitInput = {
  subscription: SubscriptionPeriod | null;
  now: Date;
};
