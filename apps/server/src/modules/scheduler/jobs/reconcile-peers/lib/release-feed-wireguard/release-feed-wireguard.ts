import { isEmpty, isNullish } from 'remeda';

import type { ReconcilePeer } from '../../reconcile-peers.job.types';
import type { ReleaseFeedWireguardInput } from './release-feed-wireguard.types';

import { peerClientName } from '../../../../../peers';
import { deleteNodeClients, peersGoneFromNode } from '../delete-node-clients';
import { isFeedWireguardPeer } from './release-feed-wireguard.helpers';

export const releaseFeedWireguard = async ({
  prisma,
  xray,
  logger,
  peers,
  nodeClients,
  online
}: ReleaseFeedWireguardInput): Promise<ReconcilePeer[]> => {
  if (isNullish(online)) {
    return [];
  }

  const idle = peers.filter((peer) => isFeedWireguardPeer(peer) && !online.has(peerClientName(peer)));

  if (isEmpty(idle)) {
    return [];
  }

  await deleteNodeClients({ xray, logger, peers: idle, nodeClients });

  const released = peersGoneFromNode({ peers: idle, nodeClients });

  if (isEmpty(released)) {
    return [];
  }

  await prisma.peer.deleteMany({ where: { id: { in: released.map((peer) => peer.id) } } });

  return released;
};
