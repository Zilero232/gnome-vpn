import type { EnsureInboundInput, PanelCredentials } from './xray-panel.types';

import { XrayClient } from '../../../../apps/server/src/lib/xray';
import { PEER_PREFIX } from '../../../../apps/server/src/modules/peers/config';
import { log } from '../../config';

export const isPanelReachable = async (credentials: PanelCredentials): Promise<boolean> => new XrayClient(credentials).isReachable();

export const ensureInbound = async ({ inbound, ...credentials }: EnsureInboundInput) => {
  const xray = new XrayClient(credentials);

  const exists = await xray.hasInbound();

  if (exists) {
    await xray.updateInbound(inbound);
  } else {
    await xray.createInbound(inbound);
  }

  await xray.restartCore('provisioned the hysteria2 inbound');

  log.done(`the hysteria2 inbound was ${exists ? 'updated' : 'created'}`);
};

export const ensureVlessInbound = async ({ inbound, ...credentials }: EnsureInboundInput) => {
  const xray = new XrayClient(credentials);

  await xray.ensureVlessInbound(inbound);
  await xray.restartCore('provisioned the vless inbound');

  log.done('the vless + reality inbound is in place');
};

export const ensureWireguardInbound = async ({ inbound, ...credentials }: EnsureInboundInput) => {
  const xray = new XrayClient(credentials);

  await xray.ensureWireguardInbound(inbound);

  const legacy = (await xray.wireguardEmails()).filter((email) => email.startsWith(PEER_PREFIX.session));

  for (const email of legacy) {
    await xray.deleteClient(email);
  }

  await xray.restartCore('provisioned the wireguard inbound');

  log.done(
    legacy.length > 0 ? `the wireguard inbound is in place, ${legacy.length} legacy desktop client(s) removed` : 'the wireguard inbound is in place'
  );
};
