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

export type LapseInput = {
  currentPeriodEnd: Date | null | undefined;
  at: Date;
};

export type RewindPeriodInput = {
  currentPeriodEnd: Date | null;
  months?: number;
  days?: number;
};
