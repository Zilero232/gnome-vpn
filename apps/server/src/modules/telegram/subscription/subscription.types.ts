import type { Plan, PlanId, PromoDiscount, SubscriptionStatus } from '@gnomevpn/schemas';

import type { BotLocale } from '../telegram.types';

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

export type AutoRenewPanelInput = {
  status: Pick<
    SubscriptionStatus,
    'cancelAtPeriodEnd' | 'currentPeriodEnd' | 'hasPaymentMethod' | 'isRecurringAvailable' | 'isTrialAvailable' | 'period'
  >;
  locale: BotLocale;
};

export type PlanButtonLabelInput = {
  plan: Plan;
  locale: BotLocale;
};

export type CheckoutIntroInput = {
  planId: PlanId;
  amountRub: number;
  discount: PromoDiscount | null;
  termsUrl: string;
  locale: BotLocale;
};

export type PlansTextInput = {
  locale: BotLocale;
  isExtending: boolean;
};

export type LinkMessageInput = {
  locale: BotLocale;
  intro: string;
  url: string;
};
