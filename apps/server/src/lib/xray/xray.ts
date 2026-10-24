import { randomUUID } from 'node:crypto';
import { isEmpty, partition } from 'remeda';

import type {
  CreateWireguardClientInput,
  HysteriaClient,
  IssuedClient,
  IssuedWireguardClient,
  IssueHysteriaClientInput,
  IssueVlessClientInput,
  NodeHealth,
  NodeTraffic,
  PanelAccess,
  SetClientsEnabledInput,
  VlessClient
} from './xray.types';

import { serializeByKey } from './key-lock';
import { PanelClient } from './panel-client';
import { ProtocolClients } from './protocol-clients';
import { WireguardClients } from './wireguard-clients';
import { INBOUND, PANEL } from './xray.constants';
import { generateAuth, requireInbound, usageRatio } from './xray.helpers';
import { CLIENT_SCHEMA } from './xray.schemas';

export class XrayClient {
  private readonly panel: PanelClient;
  private readonly hysteria: ProtocolClients<HysteriaClient>;
  private readonly vless: ProtocolClients<VlessClient>;
  private readonly wireguard: WireguardClients;

  constructor(access: PanelAccess) {
    this.panel = new PanelClient(access);

    this.hysteria = new ProtocolClients({
      panel: this.panel,
      remark: INBOUND.hysteria.remark,
      schema: CLIENT_SCHEMA.hysteria,
      credentialOf: (client) => client.auth,
      newClient: ({ email, credential, limitIp }) => ({ email, auth: credential, limitIp })
    });

    this.vless = new ProtocolClients({
      panel: this.panel,
      remark: INBOUND.vless.remark,
      schema: CLIENT_SCHEMA.vless,
      credentialOf: (client) => client.id,
      newClient: ({ email, credential, limitIp }) => ({ email, id: credential, flow: INBOUND.vless.flow, limitIp })
    });

    this.wireguard = new WireguardClients(this.panel);
  }

  createHysteriaClient({ email, auth, limitIp }: IssueHysteriaClientInput): Promise<IssuedClient> {
    return this.hysteria.create({ email, credential: auth ?? generateAuth(), limitIp });
  }

  createVlessClient({ email, id, limitIp }: IssueVlessClientInput): Promise<IssuedClient> {
    return this.vless.create({ email, credential: id ?? randomUUID(), limitIp });
  }

  createWireguardClient(input: CreateWireguardClientInput): Promise<IssuedWireguardClient> {
    return this.wireguard.create(input);
  }

  deleteClient(email: string): Promise<void> {
    return serializeByKey({ key: this.panel.nodeKey, task: () => this.panel.deleteClient(email) });
  }

  async setClientsEnabled({ emails, enabled }: SetClientsEnabledInput): Promise<void> {
    if (isEmpty(emails)) {
      return;
    }

    if (!enabled) {
      await this.bulkSetEnabled({ emails, enabled });

      return;
    }

    const tunnelled = new Set((await this.wireguard.list()).map((client) => client.email));
    const [wireguard, rest] = partition(emails, (email) => tunnelled.has(email));

    await this.bulkSetEnabled({ emails: rest, enabled });
    await this.wireguard.enable(wireguard);
  }

  async clientEnabledByEmail(): Promise<Map<string, boolean>> {
    const inbounds = await this.panel.listInbounds();
    const vless = inbounds.find((inbound) => inbound.remark === INBOUND.vless.remark);
    const wireguard = inbounds.find((inbound) => inbound.remark === INBOUND.wireguard.remark);

    const clients = [
      ...this.hysteria.clientsIn(requireInbound({ inbounds, remark: INBOUND.hysteria.remark })),
      ...(vless ? this.vless.clientsIn(vless) : []),
      ...(wireguard ? this.wireguard.clientsIn(wireguard) : [])
    ];

    return new Map(clients.map((client) => [client.email, client.enable ?? true]));
  }

  onlineEmails(): Promise<Set<string> | null> {
    return this.panel.onlineEmails();
  }

  lastOnline(): Promise<Map<string, Date>> {
    return this.panel.lastOnline();
  }

  async clientTraffic(): Promise<Map<string, NodeTraffic>> {
    const stats = await this.panel.clientTraffic();

    return new Map(stats.map((stat) => [stat.email, { up: stat.up ?? 0, down: stat.down ?? 0 }]));
  }

  async health(): Promise<NodeHealth> {
    const [inbound, status] = await Promise.all([this.panel.inbound(INBOUND.hysteria.remark), this.panel.serverStatus()]);

    return {
      isHealthy: inbound.enable && status.xray?.state === PANEL.runningState,
      cpu: status.cpu ?? null,
      memoryRatio: usageRatio(status.mem),
      tcpCount: status.tcpCount ?? null
    };
  }

  private bulkSetEnabled({ emails, enabled }: SetClientsEnabledInput): Promise<void> {
    return serializeByKey({ key: this.panel.nodeKey, task: () => this.panel.setClientsEnabled({ emails, enabled }) });
  }
}
