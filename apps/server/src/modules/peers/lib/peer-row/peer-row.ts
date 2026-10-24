import slugify from '@sindresorhus/slugify';

import { PEER_PREFIX, PEER_PROTOCOL_SUFFIX } from '@/modules/peers/config';

import type { PeerNameInput, PeerRevocation } from './peer-row.types';

export const peerClientName = ({ userId, kind, name, nodeId, protocol }: PeerNameInput): string => {
  const prefix = kind === 'session' ? PEER_PREFIX.session : PEER_PREFIX.config;
  const base = `${prefix}${userId}-${slugify(name ?? '')}`;
  const scoped = nodeId ? `${base}-${nodeId}` : base;

  return `${scoped}${protocol ? PEER_PROTOCOL_SUFFIX[protocol] : ''}`;
};

export const peerRevocation = (at: Date): PeerRevocation => ({ revokedAt: at, state: 'disabled' });
