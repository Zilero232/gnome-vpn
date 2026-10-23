import type { NodeAlertState } from './node-health.types';

export const QUIET_NODE: NodeAlertState = {
  isAnnouncedDown: false,
  downAlertedAt: null
};
