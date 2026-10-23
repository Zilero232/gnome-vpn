import type { AdminCampaignState } from '@gnomevpn/schemas';

import type { BadgeProps } from '@/ui-kit';

export const CAMPAIGN_STATE_TONE: Record<AdminCampaignState, NonNullable<BadgeProps['tone']>> = {
  active: 'accent',
  expired: 'muted',
  usedUp: 'warning'
};
