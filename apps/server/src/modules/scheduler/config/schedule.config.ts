export const SCHEDULE = {
  reconcileCron: '*/5 * * * *',
  collectOrphansCron: '17 4 * * 0',
  geoFilesCron: '43 3 * * 1',
  bootGraceMs: 3 * 60_000
} as const;
