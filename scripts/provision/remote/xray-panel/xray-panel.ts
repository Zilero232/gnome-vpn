import type { EnsureInboundInput, InboundChange, PanelCredentials, SyncInboundsInput } from './xray-panel.types';

import {
  INBOUND_REMARK,
  PanelClient,
  REQUEST_TIMEOUT_MS,
  VLESS_INBOUND_REMARK,
  WIREGUARD_INBOUND,
  XrayClient
} from '../../../../apps/server/src/lib/xray';
import { PEER_PREFIX } from '../../../../apps/server/src/modules/peers/config';
import { log } from '../../config';
import { inboundMatches } from './xray-panel.helpers';

export const isPanelReachable = async (credentials: PanelCredentials): Promise<boolean> => new XrayClient(credentials).isReachable();

const ensureInbound = async ({ label, current, desired, create, update }: EnsureInboundInput): Promise<InboundChange> => {
  if (!current) {
    await create();
    log.done(`the ${label} inbound was created`);

    return 'created';
  }

  if (inboundMatches({ current, desired })) {
    log.done(`the ${label} inbound is already as provisioned`);

    return 'unchanged';
  }

  await update();
  log.done(`the ${label} inbound was updated`);

  return 'updated';
};

const dropLegacyWireguardClients = async (xray: XrayClient) => {
  const legacy = (await xray.wireguardEmails()).filter((email) => email.startsWith(PEER_PREFIX.session));

  for (const email of legacy) {
    await xray.deleteClient(email);
  }

  if (legacy.length > 0) {
    log.done(`${legacy.length} legacy desktop wireguard client(s) removed`);
  }
};

export const syncInbounds = async ({ inbounds, ...credentials }: SyncInboundsInput) => {
  const xray = new XrayClient(credentials);
  const existing = await new PanelClient({ ...credentials, timeout: REQUEST_TIMEOUT_MS }).listInbounds();
  const find = (remark: string) => existing.find((inbound) => inbound.remark === remark);

  log.step('syncing the inbounds');

  const hysteria = await ensureInbound({
    label: 'hysteria2',
    current: find(INBOUND_REMARK),
    desired: inbounds.hysteria,
    create: () => xray.createInbound(inbounds.hysteria),
    update: () => xray.updateInbound(inbounds.hysteria)
  });

  const vless = await ensureInbound({
    label: 'vless + reality',
    current: find(VLESS_INBOUND_REMARK),
    desired: inbounds.vless,
    create: () => xray.ensureVlessInbound(inbounds.vless),
    update: () => xray.ensureVlessInbound(inbounds.vless)
  });

  await ensureInbound({
    label: 'wireguard',
    current: find(WIREGUARD_INBOUND.remark),
    desired: inbounds.wireguard,
    create: () => xray.ensureWireguardInbound(inbounds.wireguard),
    update: () => xray.ensureWireguardInbound(inbounds.wireguard)
  });

  await dropLegacyWireguardClients(xray);

  if (hysteria === 'unchanged' && vless === 'unchanged') {
    log.done('no hysteria2 or vless inbound changed, the core keeps its sessions');

    return;
  }

  await xray.restartCore('provisioned the hysteria2 and vless inbounds');
  log.done('the core was restarted once for the inbound changes');
};
