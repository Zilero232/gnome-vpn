import { milliseconds } from 'date-fns';

export const PAYMENT_METHODS_STALE_MS = milliseconds({ hours: 1 });
