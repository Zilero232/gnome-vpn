import type { Prisma } from '@/generated';

export const PAYMENT_SETTLE_SELECT = {
  id: true,
  yookassaPaymentId: true,
  userId: true,
  status: true,
  kind: true,
  plan: true,
  extraDevices: true,
  isAutoCharge: true,
  amount: true,
  promoCodeId: true,
  createdAt: true
} as const satisfies Prisma.PaymentSelect;
