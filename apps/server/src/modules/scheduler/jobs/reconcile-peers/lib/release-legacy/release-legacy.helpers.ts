import { isNullish } from 'remeda';

import { LEGACY_PEER } from '@/modules/scheduler/jobs/reconcile-peers/reconcile-peers.job.constants';

import type { IsLegacyPeerInput } from './release-legacy.types';

export const isReplacedLegacyPeer = ({ peer, replaced }: IsLegacyPeerInput): boolean =>
  peer.kind === 'config' && peer.name === LEGACY_PEER.name && isNullish(peer.deviceId) && isNullish(peer.revokedAt) && replaced.has(peer.userId);
