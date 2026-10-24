import { TUNNEL_PROTOCOL } from '@gnomevpn/schemas';
import { isEmpty } from 'remeda';
import { match } from 'ts-pattern';

import { activeDeviceLimit, describeError } from '@/common/lib';
import { deviceIpLimit } from '@/modules/devices';
import { peerClientName, wireguardPublicKey } from '@/modules/peers';

import type { RestoreMissingInput } from './restore-missing.types';

export const restoreMissing = async ({ prisma, logger, xray, node, peers, nodeClients }: RestoreMissingInput): Promise<number> => {
  const missing = peers.filter((peer) => !nodeClients.has(peerClientName(peer)));

  if (isEmpty(missing)) {
    return 0;
  }

  let restored = 0;
  let failed = 0;

  for (const peer of missing) {
    const email = peerClientName(peer);
    const limitIp = peer.deviceId ? deviceIpLimit(peer.device?.key) : activeDeviceLimit(peer.user.subscription);

    try {
      await match(peer.protocol)
        .with(TUNNEL_PROTOCOL.vless, () => xray.createVlessClient({ email, id: peer.nodeCredential, limitIp }))
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
        .otherwise(() => xray.createClient({ email, auth: peer.nodeCredential, limitIp }));

      nodeClients.set(email, true);
      restored += 1;
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

  return restored;
};
