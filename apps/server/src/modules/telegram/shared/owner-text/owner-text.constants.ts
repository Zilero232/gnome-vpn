import type { BotText } from '@/modules/telegram/telegram.types';

import { BOT_THROTTLE } from '@/modules/telegram/config';

import type { LoadResource, NodeAlertState, NodeRestart, RefundAlertReason } from './owner-text.types';

export const OWNER_ALERT = {
  nodeDownAfterMinutes: 3,
  repeatMs: BOT_THROTTLE.limits.ownerAlert.windowMs,
  errorLength: 300
} as const;

export const QUIET_NODE: NodeAlertState = {
  isAnnouncedDown: false,
  downAlertedAt: null
};

export const ALERT_TEXT = {
  load: { cpu: 'alertNodeCpu', memory: 'alertNodeMemory' } satisfies Record<LoadResource, keyof BotText>,
  restart: { reboot: 'alertNodeRebooted', core: 'alertNodeCoreRestarted' } satisfies Record<NodeRestart, keyof BotText>,
  refundReason: {
    manual: 'alertRefundManual',
    partial: 'alertRefundPartial',
    orphan: 'alertRefundOrphan',
    lapsed: 'alertRefundLapsed',
    canceled: 'alertRefundCanceled',
    discountUsed: 'alertRefundDiscountUsed'
  } satisfies Record<RefundAlertReason, keyof BotText>,
  separator: ' · '
} as const;
