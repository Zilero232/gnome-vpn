export type ProbeStamps = {
  lastHealthyAt: Date | null;
  lastCheckedAt: Date | null;
  isOverloaded: boolean;
};

export type PassedCheckInput = {
  lastHealthyAt: Date | null;
  checkedAt: Date;
};
