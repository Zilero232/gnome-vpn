import type { AdminPayment } from '@gnomevpn/schemas';
import type { ReactNode } from 'react';

export type UserPaymentsSlot = {
  userId: string;
  payments: AdminPayment[];
};

export type UserCardProps = {
  userId: string;
  renderPayments: (slot: UserPaymentsSlot) => ReactNode;
};
