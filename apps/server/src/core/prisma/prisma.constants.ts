export const PRISMA_ERROR = {
  notFound: 'P2025',
  uniqueViolation: 'P2002',
  serializationFailure: 'P2034'
} as const;

export const PRISMA_RETRY = {
  serializable: { retries: 4, minTimeoutMs: 25 },
  unique: { retries: 1, minTimeoutMs: 10 }
} as const;
