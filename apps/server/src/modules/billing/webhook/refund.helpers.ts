import { isNullish } from 'remeda';

import { hasLapsedBeyondGrace } from '@/common/lib';

import type { PartialRefundInput, RefundReason, RefundReasonInput } from './refund.types';

import { REFUND } from './webhook.constants';

export const refundReason = ({ userId, purchase, currentPeriodEnd, now }: RefundReasonInput): RefundReason | null => {
  if (isNullish(userId)) {
    return 'orphan';
  }

  if (purchase.kind !== 'extraDevices') {
    return null;
  }

  return hasLapsedBeyondGrace({ currentPeriodEnd, at: now }) ? 'lapsed' : null;
};

export const isPartialRefund = ({ refundedRub, amount }: PartialRefundInput): boolean => refundedRub < amount.toNumber();

export const refundIdempotenceKey = (paymentRowId: string): string => `${REFUND.idempotencePrefix}${paymentRowId}`;
