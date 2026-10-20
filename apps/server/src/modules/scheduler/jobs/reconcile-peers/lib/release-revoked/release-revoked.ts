import { isEmpty, isNonNullish } from 'remeda';

import type { ReleaseRevokedInput, StillRevokedInput } from './release-revoked.types';

import { deleteNodeClients, peersGoneFromNode } from '../delete-node-clients';

const stillRevoked = async ({ prisma, peers }: StillRevokedInput): Promise<Set<string>> => {
  const rows = await prisma.peer.findMany({
    where: { id: { in: peers.map((peer) => peer.id) }, revokedAt: { not: null } },
    select: { id: true }
  });

  return new Set(rows.map((row) => row.id));
};

export const releaseRevoked = async ({ prisma, xray, logger, peers, nodeClients }: ReleaseRevokedInput): Promise<number> => {
  const candidates = peers.filter((peer) => isNonNullish(peer.revokedAt));

  if (isEmpty(candidates)) {
    return 0;
  }

  const confirmed = await stillRevoked({ prisma, peers: candidates });
  const revoked = candidates.filter((peer) => confirmed.has(peer.id));

  if (isEmpty(revoked)) {
    return 0;
  }

  const deleted = await deleteNodeClients({ xray, logger, peers: revoked, nodeClients });
  const released = peersGoneFromNode({ peers: revoked, nodeClients });

  if (!isEmpty(released)) {
    await prisma.peer.deleteMany({
      where: { id: { in: released.map((peer) => peer.id) }, revokedAt: { not: null } }
    });
  }

  return deleted.length;
};
