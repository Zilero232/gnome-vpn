import type { CheckoutLocale, CheckoutResult, PlanId, PromoDiscount } from '@gnomevpn/schemas';

import type { PrismaExecutor } from '@/core';
import type { Prisma } from '@/generated';

export type LocalizedReturnUrlInput = {
  baseUrl: string;
  locale: CheckoutLocale | undefined;
};

export type CheckoutReturnInput = {
  returnUrl?: string;
  locale?: CheckoutLocale;
};

export type CreateCheckoutServiceInput = CheckoutReturnInput & {
  userId: string;
  planId: PlanId;
};

export type BuyExtraDevicesServiceInput = CheckoutReturnInput & {
  userId: string;
  quantity: number;
};

export type CheckoutOutcome = CheckoutResult & {
  amountRub: number;
  discount: PromoDiscount | null;
};

export type ReusablePaymentInput = {
  userId: string;
  returnUrl: string;
  where: Prisma.PaymentWhereInput;
};

export type OpenPaymentInput = {
  amountRub: number;
  description: string;
  returnUrl: string;
  savePaymentMethod: boolean;
};

export type OpenedPayment = {
  id: string;
  confirmationUrl: string;
};

export type ClaimedExtraDevicesInput = {
  userId: string;
  db: PrismaExecutor;
};
