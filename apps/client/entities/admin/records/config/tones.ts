import type { PeriodKind } from '@gnomevpn/schemas';

import type { BadgeProps } from '@/ui-kit';

import type { PaymentState } from '../lib';

export const ACCESS_TONE: Record<PeriodKind, NonNullable<BadgeProps['tone']>> = {
  none: 'muted',
  trial: 'warning',
  paid: 'accent'
};

export const PAYMENT_TONE: Record<PaymentState, NonNullable<BadgeProps['tone']>> = {
  pending: 'muted',
  succeeded: 'accent',
  refundRequested: 'warning',
  canceled: 'muted',
  refunded: 'danger'
};
