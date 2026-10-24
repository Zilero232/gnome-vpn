export type ExtendPeriodInput = {
  currentPeriodEnd: Date | null | undefined;
  months?: number;
  days?: number;
  now?: Date;
};

export type RewindPeriodInput = {
  currentPeriodEnd: Date | null;
  months?: number;
  days?: number;
};

export type LapseInput = {
  currentPeriodEnd: Date | null | undefined;
  at: Date;
};

export type AccessExtensionInput = {
  currentPeriodEnd: Date | null | undefined;
  days: number;
  now: Date;
};

export type AccessExtension = {
  currentPeriodEnd: Date;
  resetsExtras: boolean;
};

export type ExtraDevicesGrantInput = {
  current: number;
  quantity: number;
};

export type ExtraDevicesGrant = {
  granted: number;
  dropped: number;
};

export type SubscriptionPeriod = {
  currentPeriodEnd: Date | null;
  extraDevices: number;
};
