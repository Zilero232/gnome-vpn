export const ALERT = {
  reconcileFailureStreak: 5,
  nodeCpuPercent: 90,
  nodeMemoryRatio: 0.9,
  loadStreakMinutes: 3,
  restartToleranceMs: 30_000
} as const;
