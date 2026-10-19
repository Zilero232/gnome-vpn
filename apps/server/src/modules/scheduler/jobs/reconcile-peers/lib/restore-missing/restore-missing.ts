import { TUNNEL_PROTOCOL } from '@gnomevpn/schemas';
import { isEmpty } from 'remeda';
import { match } from 'ts-pattern';

import type { RestoreMissingInput } from './restore-missing.types';

import { activeDeviceLimit, describeError } from '../../../../../../common/lib';
import { DEVICE_PEER } from '../../../../../devices';
import { peerClientName, wireguardPublicKey } from '../../../../../peers';

export const restoreMissing = async ({ prisma, logger, xray, node, peers, nodeClients }: RestoreMissingInput): Promise<boolean> => {
  const missing = peers.filter((peer) => !nodeClients.has(peerClientName(peer)));

  if (isEmpty(missing)) {
    return false;
  }

  let restored = 0;
  let needsRestart = false;
  let failed = 0;

  for (const peer of missing) {
    const email = peerClientName(peer);
    const limitIp = peer.deviceId ? DEVICE_PEER.ipsPerClient : activeDeviceLimit(peer.user.subscription);

    try {
      await match(peer.protocol)
        .with(TUNNEL_PROTOCOL.vless, () => xray.createVlessClient({ email, id: peer.nodeCredential, limitIp, deferRestart: true }))
        .with(TUNNEL_PROTOCOL.wireguard, async () => {
          const created = await xray.createWireguardClient({
            email,
            privateKey: peer.nodeCredential,
            publicKey: wireguardPublicKey(peer.nodeCredential),
            limitIp,
            address: peer.tunnelAddress
          });

          if (created.address !== peer.tunnelAddress) {
            await prisma.peer.update({ where: { id: peer.id }, data: { tunnelAddress: created.address } });
          }
        })
        .otherwise(() => xray.createClient({ email, auth: peer.nodeCredential, limitIp, deferRestart: true }));

      nodeClients.set(email, true);
      restored += 1;
      needsRestart ||= peer.protocol !== TUNNEL_PROTOCOL.wireguard;
    } catch (error) {
      failed += 1;
      logger.warn(`restoring ${email} failed on node ${node.id}: ${describeError(error)}`);
    }
  }

  if (failed > 0) {
    logger.warn(`restoring ${failed} of ${missing.length} peer(s) failed on node ${node.id}`);
  }

  if (restored > 0) {
    logger.log(`restored ${restored} peer(s) missing from node ${node.id}`);
  }

  return needsRestart;
};
