import { IDENTIFIED_NODE_SELECT } from '../../../../common/lib';

export const ACTIVITY_PEER_SELECT = {
  deviceId: true,
  userId: true,
  kind: true,
  name: true,
  nodeId: true,
  protocol: true
} as const;

export const PROBE_NODE_SELECT = {
  ...IDENTIFIED_NODE_SELECT,
  lastHealthyAt: true,
  createdAt: true
} as const;
