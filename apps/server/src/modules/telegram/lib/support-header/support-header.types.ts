import type { PeriodKind, PlanId } from '@gnomevpn/schemas';
import type { User } from 'grammy/types';

import type { BotLocale } from '@/modules/telegram/telegram.types';

export type SupportAccount = {
  email: string;
  locale: BotLocale;
  deviceCount: number;
  period: PeriodKind;
  plan: PlanId;
  currentPeriodEnd: Date | null;
};

export type SupportHeaderInput = {
  sender: User;
  account: SupportAccount | null;
  locale: BotLocale;
};

export type AccessLineInput = {
  account: SupportAccount;
  locale: BotLocale;
};
