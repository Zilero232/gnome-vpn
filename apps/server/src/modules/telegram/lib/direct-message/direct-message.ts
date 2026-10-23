import type { AdminMessageOutcome } from '@gnomevpn/schemas';

import { GrammyError } from 'grammy';

import { DIRECT_MESSAGE } from '../../config';

export const failedDelivery = (error: unknown): Extract<AdminMessageOutcome, 'blocked' | 'failed'> =>
  error instanceof GrammyError && error.error_code === DIRECT_MESSAGE.blockedCode ? 'blocked' : 'failed';
