import type { Transformer } from 'grammy';

import { HttpError } from 'grammy';
import pRetry from 'p-retry';

import { BOT_API } from '@/modules/telegram/config';

export const retryNetworkErrors: Transformer = (prev, method, payload, signal) =>
  pRetry(() => prev(method, payload, signal), {
    retries: BOT_API.calls.retries,
    minTimeout: BOT_API.calls.backoffMs,
    shouldRetry: ({ error }) => error instanceof HttpError
  });
