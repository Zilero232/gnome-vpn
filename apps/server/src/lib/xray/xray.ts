import { Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { isEmpty, isNullish, partition } from 'remeda';

import { AppServiceUnavailableException } from '@/common/exceptions';

import type { CreateClientResult, SetClientsEnabledInput } from './hysteria';
import type { CreateVlessClientResult } from './vless';
import type { CreateWireguardClientInput, CreateWireguardClientResult } from './wireguard';
import type {
  EnsureInboundInput,
  IssueClientInput,
  IssueVlessClientInput,
  NodeHealth,
  NodeTraffic,
  RewriteInboundInput,
  XrayClientOptions
} from './xray.types';

import { coalesceByKey } from './coalesce';
import { HysteriaClients } from './hysteria';
import { inboundPayload, Inbounds, requireInbound } from './inbounds';
import { PanelClient } from './panel-client';
import { serializeByKey } from './serialize';
import { VLESS_INBOUND_REMARK, VlessClients } from './vless';
import { WIREGUARD_INBOUND, WireguardClients } from './wireguard';
import { REQUEST_TIMEOUT_MS, XRAY_STATE_RUNNING } from './xray.constants';
import { generateAuth, readClients, usageRatio } from './xray.helpers';

export class XrayClient {
  private static readonly logger = new Logger(XrayClient.name);

  private readonly panel: PanelClient;
  private readonly nodeKey: string;
  private readonly inbounds: Inbounds;
  private readonly hysteria: HysteriaClients;
  private readonly vless: VlessClients;
  private readonly wireguard: WireguardClients;

  constructor(opts: XrayClientOptions) {
    this.nodeKey = opts.baseUrl.replace(/\/$/, '');

    this.panel = new PanelClient({
      baseUrl: this.nodeKey,
      token: opts.token,
      timeout: REQUEST_TIMEOUT_MS
    });

    this.inbounds = new Inbounds(this.panel);
    this.hysteria = new HysteriaClients({ panel: this.panel, inbounds: this.inbounds, nodeKey: this.nodeKey });
    this.vless = new VlessClients({ panel: this.panel, inbounds: this.inbounds, nodeKey: this.nodeKey });
    this.wireguard = new WireguardClients({ panel: this.panel, inbounds: this.inbounds, nodeKey: this.nodeKey });
  }

  async hasInbound(): Promise<boolean> {
    return Boolean(await this.inbounds.find());
  }

  async createInbound(inbound: Record<string, unknown>): Promise<void> {
    await this.inbounds.create({ inbound });
  }

  private async rewriteInbound({ current, inbound, remark }: RewriteInboundInput): Promise<void> {
    const clients = readClients(current);

    if (isNullish(clients)) {
      throw new AppServiceUnavailableException('NODE_UNAVAILABLE', 'refusing to rewrite an inbound whose clients could not be read');
    }

    const settings = { ...(inbound.settings as object), clients };

    await this.panel.updateInbound({ id: current.id, payload: inboundPayload({ inbound: { ...inbound, settings }, remark }) });
  }

  async updateInbound(inbound: Record<string, unknown>): Promise<void> {
    return serializeByKey({
      key: this.nodeKey,
      task: async () => {
        const current = await this.inbounds.get();

        await this.rewriteInbound({ current, inbound });
      }
    });
  }

  async ensureVlessInbound(inbound: Record<string, unknown>): Promise<void> {
    return this.ensureInboundByRemark({ inbound, remark: VLESS_INBOUND_REMARK });
  }

  async ensureWireguardInbound(inbound: Record<string, unknown>): Promise<void> {
    return this.ensureInboundByRemark({ inbound, remark: WIREGUARD_INBOUND.remark });
  }

  private async ensureInboundByRemark({ inbound, remark }: EnsureInboundInput): Promise<void> {
    return serializeByKey({
      key: this.nodeKey,
      task: async () => {
        const current = await this.inbounds.find(remark);

        if (isNullish(current)) {
          await this.inbounds.create({ inbound, remark });

          return;
        }

        await this.rewriteInbound({ current, inbound, remark });
      }
    });
  }

  async createWireguardClient(input: CreateWireguardClientInput): Promise<CreateWireguardClientResult> {
    return this.wireguard.create(input);
  }

  async createClient({ email, auth, limitIp }: IssueClientInput): Promise<CreateClientResult> {
    return this.hysteria.create({ email, auth: auth ?? generateAuth(), limitIp });
  }

  async createVlessClient({ email, id, limitIp }: IssueVlessClientInput): Promise<CreateVlessClientResult> {
    return this.vless.create({ email, id: id ?? randomUUID(), limitIp });
  }

  async deleteClient(email: string): Promise<void> {
    return this.hysteria.delete(email);
  }

  async setClientsEnabled({ emails, enabled }: SetClientsEnabledInput): Promise<void> {
    if (isEmpty(emails)) {
      return;
    }

    if (!enabled) {
      await this.hysteria.setEnabled({ emails, enabled });

      return;
    }

    const tunnelled = new Set((await this.wireguard.list()).map((client) => client.email));
    const [wireguard, rest] = partition(emails, (email) => tunnelled.has(email));

    await this.hysteria.setEnabled({ emails: rest, enabled });
    await this.wireguard.enable(wireguard);
  }

  async clientEnabledByEmail(): Promise<Map<string, boolean>> {
    const inbounds = await this.inbounds.list();
    const vless = inbounds.find((inbound) => inbound.remark === VLESS_INBOUND_REMARK);
    const wireguard = inbounds.find((inbound) => inbound.remark === WIREGUARD_INBOUND.remark);

    const clients = [
      ...this.hysteria.clientsIn(requireInbound({ inbounds })),
      ...(vless ? this.vless.clientsIn(vless) : []),
      ...(wireguard ? this.wireguard.clientsIn(wireguard) : [])
    ];

    return new Map(clients.map((client) => [client.email, client.enable ?? true]));
  }

  async wireguardEmails(): Promise<string[]> {
    return (await this.wireguard.list()).map((client) => client.email);
  }

  async restartCore(reason: string): Promise<void> {
    await coalesceByKey({
      key: this.nodeKey,
      task: () => {
        XrayClient.logger.log(`restarting the core on ${new URL(this.nodeKey).host}: ${reason}`);

        return this.panel.restartCore();
      }
    });
  }

  async onlineEmails(): Promise<Set<string> | null> {
    return this.panel.onlineEmails();
  }

  lastOnline(): Promise<Map<string, Date>> {
    return this.panel.lastOnline();
  }

  async clientTraffic(): Promise<Map<string, NodeTraffic>> {
    const stats = await this.panel.clientTraffic();

    return new Map(stats.map((stat) => [stat.email, { up: stat.up ?? 0, down: stat.down ?? 0 }]));
  }

  async isReachable(): Promise<boolean> {
    try {
      await this.panel.listInbounds();

      return true;
    } catch (error) {
      XrayClient.logger.warn(`node ${new URL(this.nodeKey).host} unreachable: ${error}`);

      return false;
    }
  }

  async health(): Promise<NodeHealth> {
    const [inbound, status] = await Promise.all([this.inbounds.get(), this.panel.serverStatus()]);

    return {
      isHealthy: inbound.enable && status.xray?.state === XRAY_STATE_RUNNING,
      cpu: status.cpu ?? null,
      memoryRatio: usageRatio(status.mem),
      tcpCount: status.tcpCount ?? null
    };
  }
}
