import pRetry from 'p-retry';

import { isPrismaRequestError, UNIQUE_VIOLATION } from '../prisma';
import { UNIQUE_RETRY } from './unique-retry.constants';

const isUniqueViolation = (error: unknown): boolean => isPrismaRequestError(error) && error.code === UNIQUE_VIOLATION;

export const withUniqueRetry = <T>(run: () => Promise<T>): Promise<T> =>
  pRetry(run, {
    retries: UNIQUE_RETRY.retries,
    minTimeout: UNIQUE_RETRY.minTimeoutMs,
    shouldRetry: ({ error }) => isUniqueViolation(error)
  });
