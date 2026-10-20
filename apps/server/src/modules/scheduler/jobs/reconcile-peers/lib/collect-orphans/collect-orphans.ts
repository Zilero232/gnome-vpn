import { isEmpty, isNullish } from 'remeda';

import type { CollectOrphansInput, NamedOnNodeInput } from './collect-orphans.types';

import { peerClientName } from '../../../../../peers';
import { isServerOwned } from './collect-orphans.helpers';

const namedOnNode = async ({ prisma, nodeId }: NamedOnNodeInput): Promise<Set<string>> => {
  const rows = await prisma.peer.findMany({
    where: { nodeId },
    select: { userId: true, kind: true, name: true, nodeId: true, protocol: true }
  });

  return new Set(rows.map((row) => peerClientName(row)));
};

export const collectOrphans = async ({ prisma, xray, nodeId, peers, nodeClients, online }: CollectOrphansInput): Promise<number> => {
  if (isNullish(online)) {
    return 0;
  }

  const known = new Set(peers.map((peer) => peerClientName(peer)));
  const candidates = [...nodeClients.keys()].filter((email) => !known.has(email) && isServerOwned(email) && !online.has(email));

  if (isEmpty(candidates)) {
    return 0;
  }

  const named = await namedOnNode({ prisma, nodeId });
  const doomed = candidates.filter((email) => !named.has(email));

  await Promise.all(doomed.map((email) => xray.deleteClient(email)));

  return doomed.length;
};
