import type { Prisma } from '@/generated';

export const PEER_PREFIX = {
  session: 'app-',
  config: 'cfg-'
} as const;

export const PEER_PROTOCOL_SUFFIX = {
  hysteria2: '',
  vless: '-vl',
  wireguard: '-wg'
} as const;

export const PEER_NAME_SELECT = {
  userId: true,
  kind: true,
  name: true,
  nodeId: true,
  protocol: true
} as const satisfies Prisma.PeerSelect;

export const PEER_REF_SELECT = {
  id: true,
  ...PEER_NAME_SELECT,
  nodeCredential: true
} as const satisfies Prisma.PeerSelect;
