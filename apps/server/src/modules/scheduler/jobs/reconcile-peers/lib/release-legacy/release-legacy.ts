import { subHours } from 'date-fns';
import { isEmpty, isNullish, unique } from 'remeda';

import type { ReconcilePeer } from '@/modules/scheduler/jobs/reconcile-peers/reconcile-peers.job.types';

import { DEVICE_KEY } from '@/modules/devices';
import { peerClientName } from '@/modules/peers';
import { LEGACY_PEER } from '@/modules/scheduler/jobs/reconcile-peers/reconcile-peers.job.constants';

import type { ReleaseLegacyInput } from './release-legacy.types';

import { isQuietClient } from '../client-presence';
import { deleteNodeClients, peersGoneFromNode } from '../delete-node-clients';
import { isReplacedLegacyPeer } from './release-legacy.helpers';

export const releaseLegacy = async ({ prisma, xray, logger, peers, nodeClients, presence, now }: ReleaseLegacyInput): Promise<ReconcilePeer[]> => {
  const owners = unique(peers.filter((peer) => peer.name === LEGACY_PEER.name).map((peer) => peer.userId));

  if (isNullish(presence) || isEmpty(owners)) {
    return [];
  }

  const settled = await prisma.device.findMany({
    where: {
      userId: { in: owners },
      createdAt: { lt: subHours(now, LEGACY_PEER.graceHours) },
      NOT: { key: { startsWith: DEVICE_KEY.wireguard } }
    },
    distinct: ['userId'],
    select: { userId: true }
  });

  const replaced = new Set(settled.map((device) => device.userId));

  const idle = peers.filter((peer) => isReplacedLegacyPeer({ peer, replaced }) && isQuietClient({ email: peerClientName(peer), presence, now }));

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
