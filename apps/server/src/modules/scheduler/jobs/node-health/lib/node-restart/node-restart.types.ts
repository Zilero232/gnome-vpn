export type NodeLifetime = {
  bootedAt: Date | null;
  coreStartedAt: Date | null;
};

export type NodeRestartInput = {
  previous: NodeLifetime;
  current: NodeLifetime;
};

export type StartedLaterInput = {
  previous: Date | null;
  current: Date | null;
};
