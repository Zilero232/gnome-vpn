import type { NodeState } from '@gnomevpn/schemas';

import type { BadgeProps } from '@/ui-kit';

export const STATE_BADGE: Record<NodeState, BadgeProps['tone']> = {
  up: 'accent',
  degraded: 'warning',
  down: 'danger'
};

export const CHECKED_TICK_MS = 30_000;
