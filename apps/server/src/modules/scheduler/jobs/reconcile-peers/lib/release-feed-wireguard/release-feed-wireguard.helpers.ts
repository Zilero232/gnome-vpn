import { TUNNEL_PROTOCOL } from '@gnomevpn/schemas';
import { isNonNullish, isNullish } from 'remeda';

import type { ReconcilePeer } from '../../reconcile-peers.job.types';

import { DEVICE_KEY } from '../../../../../devices';

export const isFeedWireguardPeer = (peer: ReconcilePeer): boolean =>
  peer.protocol === TUNNEL_PROTOCOL.wireguard &&
  peer.kind === 'config' &&
  isNullish(peer.revokedAt) &&
  isNonNullish(peer.device) &&
  !peer.device.key.startsWith(DEVICE_KEY.wireguard);
