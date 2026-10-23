import { sumBy } from 'remeda';

import type { AmountOfInput, PaymentStatusGroup, PaymentTotals } from './payment-totals.types';

const amountOf = ({ groups, status }: AmountOfInput): number => groups.find((group) => group.status === status)?._sum.amount?.toNumber() ?? 0;

export const paymentTotals = (groups: PaymentStatusGroup[]): PaymentTotals => ({
  count: sumBy(groups, (group) => group._count._all),
  paid: amountOf({ groups, status: 'succeeded' }),
  refunded: amountOf({ groups, status: 'refunded' })
});
