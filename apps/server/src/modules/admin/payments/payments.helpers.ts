import { isNonNullish, sumBy } from 'remeda';

import type { Prisma } from '@/generated';

import type { PaymentStatusGroup, PaymentTotals, PaymentWhereInput } from './payments.types';

import { groupTotal, periodStart } from '../shared/listing.helpers';

export const paymentWhere = ({ filter, now }: PaymentWhereInput): Prisma.PaymentWhereInput => {
  const start = periodStart({ period: filter.period, now });

  return {
    ...(isNonNullish(filter.status) && { status: filter.status }),
    ...(isNonNullish(filter.kind) && { kind: filter.kind }),
    ...(isNonNullish(filter.plan) && { plan: filter.plan }),
    ...(isNonNullish(start) && { createdAt: { gte: start } })
  };
};

export const paymentTotals = (groups: PaymentStatusGroup[]): PaymentTotals => ({
  count: sumBy(groups, (group) => group._count._all),
  paid: groupTotal({ groups, by: 'status', value: 'succeeded' }).amount,
  refunded: groupTotal({ groups, by: 'status', value: 'refunded' }).amount
});
