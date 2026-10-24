import { isNonNullish } from 'remeda';

import type { Prisma } from '@/generated';

import type { PaymentWhereInput } from './payment-filter.types';

import { periodStart } from '../period-start';

export const paymentWhere = ({ filter, now }: PaymentWhereInput): Prisma.PaymentWhereInput => {
  const start = periodStart({ period: filter.period, now });

  return {
    ...(isNonNullish(filter.status) && { status: filter.status }),
    ...(isNonNullish(filter.kind) && { kind: filter.kind }),
    ...(isNonNullish(filter.plan) && { plan: filter.plan }),
    ...(isNonNullish(start) && { createdAt: { gte: start } })
  };
};
