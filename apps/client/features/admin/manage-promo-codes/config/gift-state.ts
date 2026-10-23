import type { BadgeProps } from '@/ui-kit';

import type { GiftState } from '../lib';

export const GIFT_STATE_TONE: Record<GiftState, NonNullable<BadgeProps['tone']>> = {
  waiting: 'muted',
  redeemed: 'accent',
  revoked: 'danger'
};
