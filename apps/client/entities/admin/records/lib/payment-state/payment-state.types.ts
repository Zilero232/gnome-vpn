import type { AdminPayment, PaymentStatus } from '@gnomevpn/schemas';

export type PaymentState = 'refundRequested' | PaymentStatus;

export type PaymentStateInput = Pick<AdminPayment, 'refundRequestedAt' | 'status'>;
