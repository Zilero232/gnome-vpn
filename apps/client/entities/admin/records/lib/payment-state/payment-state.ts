import { isNonNullish } from 'remeda';

import type { PaymentState, PaymentStateInput } from './payment-state.types';

export const paymentState = ({ status, refundRequestedAt }: PaymentStateInput): PaymentState =>
  status === 'succeeded' && isNonNullish(refundRequestedAt) ? 'refundRequested' : status;

export const isRefundable = (payment: PaymentStateInput): boolean => paymentState(payment) === 'succeeded';
