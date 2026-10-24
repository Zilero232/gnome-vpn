import type { z } from 'zod';

import type { YOOKASSA_STATUS } from './yookassa.constants';
import type { paymentMethodResponseSchema, paymentResponseSchema, refundResponseSchema } from './yookassa.schemas';

export type PaymentStatus = (typeof YOOKASSA_STATUS.payment)[number];

export type RefundStatus = (typeof YOOKASSA_STATUS.refund)[number];

export type PaymentMethodStatus = (typeof YOOKASSA_STATUS.paymentMethod)[number];

export type PaymentResponse = z.infer<typeof paymentResponseSchema>;

export type RefundResponse = z.infer<typeof refundResponseSchema>;

export type PaymentMethodResponse = z.infer<typeof paymentMethodResponseSchema>;

export type CardData = NonNullable<PaymentMethodResponse['card']>;

export type YooKassaAmount = {
  value: string;
  currency: string;
};

export type ShopSettings = {
  paymentMethods: string[];
};

export type CreatePaymentInput = {
  amountRub: number;
  description: string;
  returnUrl: string;
  idempotenceKey: string;
  savePaymentMethod: boolean;
};

export type ChargeRecurringInput = {
  amountRub: number;
  description: string;
  paymentMethodId: string;
  idempotenceKey: string;
};

export type CreatePaymentResult = {
  id: string;
  status: PaymentStatus;
  confirmationUrl: string | null;
};

export type PaymentInfo = {
  id: string;
  status: PaymentStatus;
  paymentMethodId: string | null;
  paymentMethodTitle: string | null;
  cancellationReason: string | null;
  confirmationUrl: string | null;
  returnUrl: string | null;
  refundedRub: number;
};

export type CreateRefundInput = {
  paymentId: string;
  amountRub: number;
  description: string;
  idempotenceKey: string;
};

export type RefundInfo = {
  id: string;
  paymentId: string;
  status: RefundStatus;
  amountRub: number;
};

export type BindPaymentMethodInput = {
  returnUrl: string;
  idempotenceKey: string;
};

export type PaymentMethodInfo = {
  id: string;
  status: PaymentMethodStatus;
  title: string | null;
  confirmationUrl: string | null;
};

export type YooKassaSendInput = {
  path: string;
  init: RequestInit;
  idempotenceKey?: string;
};

export type YooKassaRequestInput<T> = YooKassaSendInput & {
  schema: z.ZodType<T>;
};

export type DescribeCardInput = {
  card?: CardData | null;
  title?: string | null;
};
