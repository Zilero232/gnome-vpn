import { SUBSCRIPTION_PERIOD_SELECT } from '@/common/lib';

export const LEGACY_PEER = {
  name: 'incy',
  graceHours: 48
} as const;

export const RECONCILE_PEER_SELECT = {
  id: true,
  deviceId: true,
  revokedAt: true,
  userId: true,
  kind: true,
  name: true,
  nodeId: true,
  protocol: true,
  state: true,
  nodeCredential: true,
  tunnelAddress: true,
  device: { select: { key: true } },
  user: { select: { subscription: { select: SUBSCRIPTION_PERIOD_SELECT } } }
} as const;
