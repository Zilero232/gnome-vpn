export const SUBSCRIPTION_POLL = {
  pendingMs: 3_000,
  idleMs: 60_000,
  errorMs: 5_000,
  maxErrorMs: 60_000,
  retries: 3
} as const;
