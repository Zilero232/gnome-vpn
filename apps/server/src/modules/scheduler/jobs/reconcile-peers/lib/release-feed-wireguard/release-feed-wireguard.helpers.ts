import { TUNNEL_PROTOCOL } from '@gnomevpn/schemas';
import { isNonNullish, isNullish } from 'remeda';

import type { ReconcilePeer } from '@/modules/scheduler/jobs/reconcile-peers/reconcile-peers.job.types';

import { isWireguardDevice } from '@/modules/devices';

export const isFeedWireguardPeer = (peer: ReconcilePeer): boolean =>
  peer.protocol === TUNNEL_PROTOCOL.wireguard &&
  peer.kind === 'config' &&
  isNullish(peer.revokedAt) &&
  isNonNullish(peer.device) &&
  !isWireguardDevice(peer.device.key);
