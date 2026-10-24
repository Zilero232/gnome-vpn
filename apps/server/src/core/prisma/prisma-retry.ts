import pRetry from 'p-retry';

import { isSerializationFailure, isUniqueViolation } from './prisma-errors';
import { PRISMA_RETRY } from './prisma.constants';

export const withSerializableRetry = <T>(run: () => Promise<T>): Promise<T> =>
  pRetry(run, {
    retries: PRISMA_RETRY.serializable.retries,
    minTimeout: PRISMA_RETRY.serializable.minTimeoutMs,
    shouldRetry: ({ error }) => isSerializationFailure(error)
  });

export const withUniqueRetry = <T>(run: () => Promise<T>): Promise<T> =>
  pRetry(run, {
    retries: PRISMA_RETRY.unique.retries,
    minTimeout: PRISMA_RETRY.unique.minTimeoutMs,
    shouldRetry: ({ error }) => isUniqueViolation(error)
  });
