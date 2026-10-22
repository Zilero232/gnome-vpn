import type { SubscriptionStatus } from '@gnomevpn/schemas';

import type { BotLocale } from '../../telegram.types';

export type StatusTextInput = Pick<
  SubscriptionStatus,
  'cancelAtPeriodEnd' | 'currentPeriodEnd' | 'hasPaymentMethod' | 'isRecurringAvailable' | 'limits' | 'period' | 'plan'
> & {
  deviceCount: number;
  locale: BotLocale;
  now?: Date;
};

export type DaysLeftInput = {
  until: Date;
  now: Date;
  locale: BotLocale;
};
