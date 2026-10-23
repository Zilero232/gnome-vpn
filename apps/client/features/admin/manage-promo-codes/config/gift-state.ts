import type { AdminGiftState } from '@gnomevpn/schemas';

import type { BadgeProps } from '@/ui-kit';

export const GIFT_STATE_TONE: Record<AdminGiftState, NonNullable<BadgeProps['tone']>> = {
  waiting: 'muted',
  redeemed: 'accent',
  revoked: 'danger'
};
