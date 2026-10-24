import { pluralize } from '@/common/lib';

import type { DescribeSubscriptionInput } from './description.types';

import { PAYMENT_DESCRIPTION } from './payment.constants';

export const describeSubscription = ({ plan, kind }: DescribeSubscriptionInput): string =>
  `${PAYMENT_DESCRIPTION.subscription[kind]} ${plan.months} ${pluralize({ count: plan.months, forms: PAYMENT_DESCRIPTION.monthForms })}`;

export const describeExtraDevices = (quantity: number): string =>
  `${PAYMENT_DESCRIPTION.extraDevices} ${quantity} ${pluralize({ count: quantity, forms: PAYMENT_DESCRIPTION.deviceForms })}`;
