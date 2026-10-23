import type { NodeState } from '@gnomevpn/schemas';

import type { BadgeProps } from '@/ui-kit';

export const NODE_STATE_TONE: Record<NodeState, NonNullable<BadgeProps['tone']>> = {
  up: 'accent',
  degraded: 'warning',
  down: 'danger'
};
