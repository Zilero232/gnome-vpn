import { isNullish } from 'remeda';

import type { Inbounds, XrayInbound } from '../inbounds';
import type { PanelClient } from '../panel-client';
import type { ProtocolClientsDeps } from '../protocol-clients';
import type { CreateWireguardClientInput, CreateWireguardClientResult, ReaddInput, WireguardClient } from './wireguard.types';

import { AppServiceUnavailableException } from '../../../common/exceptions';
import { serializeByKey } from '../serialize';
import { readSettings } from '../xray.helpers';
import { WIREGUARD_INBOUND_REMARK, WIREGUARD_KEEP_ALIVE } from './wireguard.constants';
import { addressOf, hostRoute } from './wireguard.helpers';

export class WireguardClients {
  private readonly panel: PanelClient;
  private readonly inbounds: Inbounds;
  private readonly nodeKey: string;

  constructor({ panel, inbounds, nodeKey }: ProtocolClientsDeps) {
    this.panel = panel;
    this.inbounds = inbounds;
    this.nodeKey = nodeKey;
  }

  async hasInbound(): Promise<boolean> {
    return Boolean(await this.inbounds.find(WIREGUARD_INBOUND_REMARK));
  }

  async list(): Promise<WireguardClient[]> {
    const inbound = await this.inbounds.find(WIREGUARD_INBOUND_REMARK);

    return inbound ? this.clientsOf(inbound) : [];
  }

  async create({ email, privateKey, publicKey, limitIp, address }: CreateWireguardClientInput): Promise<CreateWireguardClientResult> {
    return serializeByKey({
      key: this.nodeKey,
      task: async () => {
        const inbound = await this.inbounds.get(WIREGUARD_INBOUND_REMARK);
        const existing = this.clientsOf(inbound).find((client) => client.email === email);
        const existingAddress = addressOf(existing);

        if (existing?.enable !== false && existing?.privateKey && existingAddress) {
          return { nodeCredential: existing.privateKey, address: existingAddress, email };
        }

        if (existing) {
          await this.panel.deleteClient(email);
        }

        const wanted = address ?? existingAddress;

        await this.panel.addWireguardClient({
          inboundId: inbound.id,
          email,
          privateKey,
          publicKey,
          limitIp,
          keepAlive: WIREGUARD_KEEP_ALIVE,
          ...(wanted && { allowedIPs: [hostRoute(wanted)] })
        });

        const added = this.clientsOf(await this.inbounds.get(WIREGUARD_INBOUND_REMARK)).find((client) => client.email === email);
        const assigned = addressOf(added);

        if (isNullish(assigned)) {
          await this.panel.deleteClient(email);

          throw new AppServiceUnavailableException('NODE_UNAVAILABLE', 'the panel gave the wireguard client no address');
        }

        return { nodeCredential: privateKey, address: assigned, email };
      }
    });
  }

  async enable(emails: string[]): Promise<void> {
    if (emails.length === 0) {
      return;
    }

    await serializeByKey({
      key: this.nodeKey,
      task: async () => {
        const inbound = await this.inbounds.get(WIREGUARD_INBOUND_REMARK);
        const wanted = new Set(emails);
        const disabled = this.clientsOf(inbound).filter((client) => wanted.has(client.email) && client.enable === false);

        for (const client of disabled) {
          await this.readd({ inboundId: inbound.id, client });
        }
      }
    });
  }

  private async readd({ inboundId, client }: ReaddInput): Promise<void> {
    if (!client.privateKey || !client.publicKey) {
      throw new AppServiceUnavailableException('NODE_UNAVAILABLE', `the wireguard client ${client.email} has no keys to re-add with`);
    }

    const address = addressOf(client);

    await this.panel.deleteClient(client.email);

    await this.panel.addWireguardClient({
      inboundId,
      email: client.email,
      privateKey: client.privateKey,
      publicKey: client.publicKey,
      limitIp: client.limitIp ?? 0,
      keepAlive: WIREGUARD_KEEP_ALIVE,
      ...(address && { allowedIPs: [hostRoute(address)] })
    });
  }

  private clientsOf(inbound: XrayInbound): WireguardClient[] {
    const settings = readSettings<{ clients?: (WireguardClient | null)[] }>(inbound);

    if (isNullish(settings)) {
      throw new AppServiceUnavailableException('NODE_UNAVAILABLE', 'refusing to read a wireguard inbound whose settings could not be parsed');
    }

    return (settings.clients ?? []).filter((client): client is WireguardClient => Boolean(client?.email));
  }
}
