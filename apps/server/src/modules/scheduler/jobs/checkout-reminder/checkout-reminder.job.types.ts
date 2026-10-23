import type { AbandonedCheckout } from './lib';

export type RemindInput = {
  checkout: AbandonedCheckout;
  now: Date;
};
