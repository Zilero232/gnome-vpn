import type { Plan, PlanId, PromoDiscount } from '@gnomevpn/schemas';

import type { BotLocale } from '../../telegram.types';

export type PlanButtonLabelInput = {
  plan: Plan;
  locale: BotLocale;
};

export type PlanLabelInput = {
  planId: PlanId;
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
