export type PeriodInput = {
  currentPeriodEnd: Date | null | undefined;
  months: number;
};

export type ExtendPeriodInput = {
  currentPeriodEnd: Date | null | undefined;
  days: number;
};

export type SubscriptionPeriod = {
  currentPeriodEnd: Date | null;
  extraDevices: number;
};
