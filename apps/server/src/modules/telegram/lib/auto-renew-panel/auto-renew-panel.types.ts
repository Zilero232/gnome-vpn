import type { SubscriptionStatus } from '@gnomevpn/schemas';

import type { BotLocale } from '@/modules/telegram/telegram.types';

export type AutoRenewPanelInput = {
  status: Pick<
    SubscriptionStatus,
    'cancelAtPeriodEnd' | 'currentPeriodEnd' | 'hasPaymentMethod' | 'isRecurringAvailable' | 'isTrialAvailable' | 'period'
  >;
  locale: BotLocale;
};
