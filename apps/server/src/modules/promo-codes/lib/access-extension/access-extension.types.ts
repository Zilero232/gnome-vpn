export type AccessExtensionInput = {
  currentPeriodEnd: Date | null | undefined;
  days: number;
  now: Date;
};

export type AccessExtension = {
  currentPeriodEnd: Date;
  resetsExtras: boolean;
};
