import { isEmpty, isNullish } from 'remeda';

import { AppServiceUnavailableException } from '@/common/exceptions';

import type { PanelClient } from './panel-client';
import type {
  AddWireguardClientInput,
  CreateWireguardClientInput,
  IssuedWireguardClient,
  PanelInbound,
  ReaddWireguardClientInput,
  StoredPanelClient,
  WireguardClient
} from './xray.types';

import { serializeByKey } from './key-lock';
import { INBOUND, SERVER_PEER_RESET } from './xray.constants';
import { addressOf, hostRoute, readSettings } from './xray.helpers';
import { CLIENT_SCHEMA, PANEL_SCHEMA } from './xray.schemas';

export class WireguardClients {
  constructor(private readonly panel: PanelClient) {}

  async list(): Promise<WireguardClient[]> {
    const inbound = await this.panel.findInbound(INBOUND.wireguard.remark);

    return inbound ? this.clientsIn(inbound) : [];
  }

  async create({ email, privateKey, publicKey, address }: CreateWireguardClientInput): Promise<IssuedWireguardClient> {
    return serializeByKey({
      key: this.panel.nodeKey,
      task: async () => {
        const inbound = await this.panel.inbound(INBOUND.wireguard.remark);
        const existing = this.clientsIn(inbound).find((client) => client.email === email);
        const existingAddress = addressOf(existing);

        if (existing?.enable !== false && existing?.privateKey && existingAddress) {
          return { nodeCredential: existing.privateKey, address: existingAddress, email };
        }

        if (existing) {
          await this.panel.deleteClient(email);
        }

        await this.add({ inboundId: inbound.id, email, privateKey, publicKey, address: address ?? existingAddress });

        const assigned = await this.assignedAddress(email).catch(async (error: unknown) => {
          await this.panel.deleteClient(email).catch(() => undefined);

          throw error;
        });

        if (isNullish(assigned)) {
          await this.panel.deleteClient(email);

          throw new AppServiceUnavailableException('NODE_UNAVAILABLE', 'the panel gave the wireguard client no address');
        }

        return { nodeCredential: privateKey, address: assigned, email };
      }
    });
  }

  async enable(emails: string[]): Promise<void> {
    if (isEmpty(emails)) {
      return;
    }

    await serializeByKey({
      key: this.panel.nodeKey,
      task: async () => {
        const inbound = await this.panel.inbound(INBOUND.wireguard.remark);
        const wanted = new Set(emails);
        const disabled = this.clientsIn(inbound).filter((client) => wanted.has(client.email) && client.enable === false);

        for (const client of disabled) {
          await this.readd({ inboundId: inbound.id, client });
        }
      }
    });
  }

  async clearServerKeepAlive(): Promise<number> {
    return serializeByKey({
      key: this.panel.nodeKey,
      task: async () => {
        const inbound = await this.panel.findInbound(INBOUND.wireguard.remark);

        if (isNullish(inbound)) {
          return 0;
        }

        const stale = this.storedClientsIn(inbound).filter((client) => (client.keepAlive ?? 0) > 0 || (client.limitIp ?? 0) > 0);

        for (const client of stale) {
          await this.panel.updateClient({ email: client.email, client: { ...client, ...SERVER_PEER_RESET } });
        }

        return stale.length;
      }
    });
  }

  clientsIn(inbound: PanelInbound): WireguardClient[] {
    return this.rawClientsIn(inbound).flatMap((client) => {
      const parsed = CLIENT_SCHEMA.wireguard.safeParse(client);

      return parsed.success ? [parsed.data] : [];
    });
  }

  private rawClientsIn(inbound: PanelInbound): unknown[] {
    const settings = readSettings({ inbound, schema: PANEL_SCHEMA.settings });

    if (isNullish(settings)) {
      throw new AppServiceUnavailableException('NODE_UNAVAILABLE', 'refusing to read a wireguard inbound whose settings could not be parsed');
    }

    return settings.clients ?? [];
  }

  private storedClientsIn(inbound: PanelInbound): StoredPanelClient[] {
    return this.rawClientsIn(inbound).flatMap((client) => {
      const parsed = PANEL_SCHEMA.storedClient.safeParse(client);

      return parsed.success ? [parsed.data] : [];
    });
  }

  private async assignedAddress(email: string): Promise<string | null> {
    const inbound = await this.panel.inbound(INBOUND.wireguard.remark);

    return addressOf(this.clientsIn(inbound).find((client) => client.email === email));
  }

  private async readd({ inboundId, client }: ReaddWireguardClientInput): Promise<void> {
    if (!client.privateKey || !client.publicKey) {
      throw new AppServiceUnavailableException('NODE_UNAVAILABLE', `the wireguard client ${client.email} has no keys to re-add with`);
    }

    await this.panel.deleteClient(client.email);

    await this.add({
      inboundId,
      email: client.email,
      privateKey: client.privateKey,
      publicKey: client.publicKey,
      address: addressOf(client)
    });
  }

  private async add({ inboundId, email, privateKey, publicKey, address }: AddWireguardClientInput): Promise<void> {
    await this.panel.addClient({
      inboundId,
      client: {
        email,
        privateKey,
        publicKey,
        ...(address && { allowedIPs: [hostRoute(address)] })
      }
    });
  }
}
