import { zip } from 'remeda';

import type { ReconcilePeer } from '../../reconcile-peers.job.types';
import type { DeleteNodeClientsInput, PeersGoneInput } from './delete-node-clients.types';

import { describeError } from '../../../../../../common/lib';
import { peerClientName } from '../../../../../peers';

export const deleteNodeClients = async ({ xray, logger, peers, nodeClients }: DeleteNodeClientsInput): Promise<string[]> => {
  const onNode = peers.map((peer) => peerClientName(peer)).filter((email) => nodeClients.has(email));
  const settled = zip(onNode, await Promise.allSettled(onNode.map((email) => xray.deleteClient(email))));
  const deleted: string[] = [];

  for (const [email, result] of settled) {
    if (result.status === 'rejected') {
      logger.warn(`deleting ${email} from the node failed, the next pass retries: ${describeError(result.reason)}`);

      continue;
    }

    nodeClients.delete(email);
    deleted.push(email);
  }

  return deleted;
};

export const peersGoneFromNode = ({ peers, nodeClients }: PeersGoneInput): ReconcilePeer[] =>
  peers.filter((peer) => !nodeClients.has(peerClientName(peer)));
