import type { BotText } from '../../telegram.types';
import type { LoadResource, RefundAlertReason } from './owner-alert-text.types';

export const LABEL_SEPARATOR = ' · ';

export const LOAD_TEXT: Record<LoadResource, keyof BotText> = {
  cpu: 'alertNodeCpu',
  memory: 'alertNodeMemory'
};

export const REFUND_REASON_TEXT: Record<RefundAlertReason, keyof BotText> = {
  manual: 'alertRefundManual',
  partial: 'alertRefundPartial',
  orphan: 'alertRefundOrphan',
  lapsed: 'alertRefundLapsed',
  canceled: 'alertRefundCanceled',
  discountUsed: 'alertRefundDiscountUsed'
};
