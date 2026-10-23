import type { AdminPayment } from '@gnomevpn/schemas';

export type PaymentRowsProps = {
  payments: AdminPayment[];
  caption: string;
  withUser?: boolean;
  isFaded?: boolean;
};

export type UsePaymentColumnsInput = {
  withUser: boolean;
  onRefund: (payment: AdminPayment) => void;
};
