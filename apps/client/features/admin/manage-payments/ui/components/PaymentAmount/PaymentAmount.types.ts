import type { AdminPayment } from '@gnomevpn/schemas';

export type PaymentAmountProps = {
  payment: Pick<AdminPayment, 'amount' | 'discountPercent' | 'promoCode'>;
};
