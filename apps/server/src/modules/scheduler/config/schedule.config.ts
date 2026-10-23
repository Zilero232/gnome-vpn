export const SCHEDULE = {
  reconcileCron: '*/5 * * * *',
  collectOrphansCron: '17 4 * * 0',
  geoFilesCron: '43 3 * * 1',
  winBackCron: '20 10-20 * * *',
  expiredRecordsCron: '35 4 * * *',
  localTimeZone: 'Europe/Moscow',
  bootGraceMs: 3 * 60_000
} as const;
