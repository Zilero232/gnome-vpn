import { isEmpty } from 'remeda';

import type { SyncEnabledInput } from './sync-enabled.types';

import { peerClientName } from '../../../../../peers';

export const syncEnabled = async ({ xray, peers, nodeClients }: SyncEnabledInput): Promise<number> => {
  const toEnable: string[] = [];
  const toDisable: string[] = [];

  for (const peer of peers) {
    if (peer.state !== 'active' && peer.state !== 'disabled') {
      continue;
    }

    const email = peerClientName(peer);

    if (!nodeClients.has(email)) {
      continue;
    }

    const desired = peer.state === 'active';

    if (nodeClients.get(email) !== desired) {
      (desired ? toEnable : toDisable).push(email);
    }
  }

  if (isEmpty(toEnable) && isEmpty(toDisable)) {
    return 0;
  }

  await Promise.all([xray.setClientsEnabled({ emails: toEnable, enabled: true }), xray.setClientsEnabled({ emails: toDisable, enabled: false })]);

  return toEnable.length + toDisable.length;
};
