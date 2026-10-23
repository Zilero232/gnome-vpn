import { sumBy } from 'remeda';

import type { PaymentStatusGroup, PaymentTotals } from './payment-totals.types';

import { groupTotal } from '../group-total';

export const paymentTotals = (groups: PaymentStatusGroup[]): PaymentTotals => ({
  count: sumBy(groups, (group) => group._count._all),
  paid: groupTotal({ groups, by: 'status', value: 'succeeded' }).amount,
  refunded: groupTotal({ groups, by: 'status', value: 'refunded' }).amount
});
