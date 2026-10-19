import type { DeleteNodeClientsInput } from './delete-node-clients.types';

import { peerClientName } from '../../../../../peers';

export const deleteNodeClients = async ({ xray, peers, nodeClients }: DeleteNodeClientsInput): Promise<string[]> => {
  const onNode = peers.map((peer) => peerClientName(peer)).filter((email) => nodeClients.has(email));

  await Promise.all(onNode.map((email) => xray.deleteClient(email)));

  for (const email of onNode) {
    nodeClients.delete(email);
  }

  return onNode;
};
