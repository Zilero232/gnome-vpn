import type { SubscriptionStatus } from '@gnomevpn/schemas';

import type { BotLocale } from '@/modules/telegram/telegram.types';

export type NoAccessMessageInput = {
  status: Pick<SubscriptionStatus, 'currentPeriodEnd' | 'isTrialAvailable' | 'period'>;
  locale: BotLocale;
};
