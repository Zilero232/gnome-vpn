import { IDENTIFIED_NODE_SELECT } from '@/lib/xray';
import { PEER_NAME_SELECT } from '@/modules/peers';

export const ACTIVITY_PEER_SELECT = {
  deviceId: true,
  ...PEER_NAME_SELECT
} as const;

export const PROBE_NODE_SELECT = {
  ...IDENTIFIED_NODE_SELECT,
  lastHealthyAt: true,
  bootedAt: true,
  coreStartedAt: true,
  createdAt: true
} as const;
