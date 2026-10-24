import type { EnsureInboundInput, InboundChange, PanelCredentials, SyncInboundsInput } from './xray-panel.types';

import { INBOUND, XrayClient, XrayInbounds } from '../../../../apps/server/src/lib/xray';
import { PEER_PREFIX } from '../../../../apps/server/src/modules/peers/config';
import { log } from '../../config';
import { inboundMatches } from './xray-panel.helpers';

export const isPanelReachable = async (credentials: PanelCredentials): Promise<boolean> => new XrayInbounds(credentials).isReachable();

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

const dropLegacyWireguardClients = async (credentials: PanelCredentials) => {
  const legacy = (await new XrayInbounds(credentials).wireguardEmails()).filter((email) => email.startsWith(PEER_PREFIX.session));
  const xray = new XrayClient(credentials);

  for (const email of legacy) {
    await xray.deleteClient(email);
  }

  if (legacy.length > 0) {
    log.done(`${legacy.length} legacy desktop wireguard client(s) removed`);
  }
};

export const syncInbounds = async ({ inbounds, ...credentials }: SyncInboundsInput) => {
  const panel = new XrayInbounds(credentials);
  const existing = await panel.list();
  const find = (remark: string) => existing.find((inbound) => inbound.remark === remark);

  log.step('syncing the inbounds');

  const hysteria = await ensureInbound({
    label: 'hysteria2',
    current: find(INBOUND.hysteria.remark),
    desired: inbounds.hysteria,
    create: () => panel.create({ inbound: inbounds.hysteria, remark: INBOUND.hysteria.remark }),
    update: () => panel.update({ inbound: inbounds.hysteria, remark: INBOUND.hysteria.remark })
  });

  const vless = await ensureInbound({
    label: 'vless + reality',
    current: find(INBOUND.vless.remark),
    desired: inbounds.vless,
    create: () => panel.ensure({ inbound: inbounds.vless, remark: INBOUND.vless.remark }),
    update: () => panel.ensure({ inbound: inbounds.vless, remark: INBOUND.vless.remark })
  });

  await ensureInbound({
    label: 'wireguard',
    current: find(INBOUND.wireguard.remark),
    desired: inbounds.wireguard,
    create: () => panel.ensure({ inbound: inbounds.wireguard, remark: INBOUND.wireguard.remark }),
    update: () => panel.ensure({ inbound: inbounds.wireguard, remark: INBOUND.wireguard.remark })
  });

  await dropLegacyWireguardClients(credentials);

  if (hysteria === 'unchanged' && vless === 'unchanged') {
    log.done('no hysteria2 or vless inbound changed, the core keeps its sessions');

    return;
  }

  await panel.restartCore('provisioned the hysteria2 and vless inbounds');
  log.done('the core was restarted once for the inbound changes');
};
