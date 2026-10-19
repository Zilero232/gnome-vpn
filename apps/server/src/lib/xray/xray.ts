import { Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { isNullish, partition } from 'remeda';

import type { CreateClientResult, SetClientsEnabledInput } from './hysteria';
import type { CreateVlessClientResult } from './vless';
import type { CreateWireguardClientInput, CreateWireguardClientResult } from './wireguard';
import type { IssueClientInput, IssueVlessClientInput, NodeHealth, NodeTraffic, RewriteInboundInput, XrayClientOptions } from './xray.types';

import { AppServiceUnavailableException } from '../../common/exceptions';
import { coalesceByKey } from './coalesce';
import { HysteriaClients } from './hysteria';
import { inboundPayload, Inbounds } from './inbounds';
import { PanelClient } from './panel-client';
import { serializeByKey } from './serialize';
import { VLESS_INBOUND_REMARK, VlessClients } from './vless';
import { WIREGUARD_INBOUND_REMARK, WireguardClients } from './wireguard';
import { REQUEST_TIMEOUT_MS, XRAY_STATE_RUNNING } from './xray.constants';
import { generateAuth, readClients, sumTraffic, usageRatio } from './xray.helpers';

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

  async hasVlessInbound(): Promise<boolean> {
    return Boolean(await this.inbounds.find(VLESS_INBOUND_REMARK));
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
    return serializeByKey({
      key: this.nodeKey,
      task: async () => {
        const current = await this.inbounds.find(VLESS_INBOUND_REMARK);

        if (isNullish(current)) {
          await this.inbounds.create({ inbound, remark: VLESS_INBOUND_REMARK });

          return;
        }

        await this.rewriteInbound({ current, inbound, remark: VLESS_INBOUND_REMARK });
      }
    });
  }

  async ensureWireguardInbound(inbound: Record<string, unknown>): Promise<void> {
    return serializeByKey({
      key: this.nodeKey,
      task: async () => {
        const current = await this.inbounds.find(WIREGUARD_INBOUND_REMARK);

        if (isNullish(current)) {
          await this.inbounds.create({ inbound, remark: WIREGUARD_INBOUND_REMARK });

          return;
        }

        await this.rewriteInbound({ current, inbound, remark: WIREGUARD_INBOUND_REMARK });
      }
    });
  }

  async createWireguardClient(input: CreateWireguardClientInput): Promise<CreateWireguardClientResult> {
    return this.wireguard.create(input);
  }

  async createClient({ email, auth, limitIp, deferRestart }: IssueClientInput): Promise<CreateClientResult> {
    return this.hysteria.create({ email, auth: auth ?? generateAuth(), limitIp, deferRestart });
  }

  async createVlessClient({ email, id, limitIp, deferRestart }: IssueVlessClientInput): Promise<CreateVlessClientResult> {
    return this.vless.create({ email, id: id ?? randomUUID(), limitIp, deferRestart });
  }

  async deleteClient(email: string): Promise<void> {
    return this.hysteria.delete(email);
  }

  async setClientsEnabled({ emails, enabled }: SetClientsEnabledInput): Promise<boolean> {
    const tunnelled = new Set((await this.wireguard.list()).map((client) => client.email));
    const [wireguard, rest] = partition(emails, (email) => tunnelled.has(email));

    if (!enabled) {
      await this.hysteria.setEnabled({ emails, enabled });

      return rest.length > 0;
    }

    await this.hysteria.setEnabled({ emails: rest, enabled });
    await this.wireguard.enable(wireguard);

    return rest.length > 0;
  }

  async clientEnabledByEmail(): Promise<Map<string, boolean>> {
    const hasVless = await this.hasVlessInbound();

    const [hysteria, vless, wireguard] = await Promise.all([this.hysteria.list(), hasVless ? this.vless.list() : [], this.wireguard.list()]);

    return new Map([...hysteria, ...vless, ...wireguard].map((client) => [client.email, client.enable ?? true]));
  }

  async wireguardEmails(): Promise<string[]> {
    return (await this.wireguard.list()).map((client) => client.email);
  }

  async restartCore(reason: string): Promise<void> {
    XrayClient.logger.log(`restarting the core on ${new URL(this.nodeKey).host}: ${reason}`);

    await coalesceByKey({ key: this.nodeKey, task: () => this.panel.restartCore() });
  }

  async onlineEmails(): Promise<Set<string> | null> {
    return this.panel.onlineEmails();
  }

  async trafficFor(emails: Set<string>): Promise<NodeTraffic> {
    const stats = await this.panel.clientTraffic();

    const mine = stats.filter((stat) => emails.has(stat.email));

    return sumTraffic(mine.map((stat) => ({ up: stat.up ?? 0, down: stat.down ?? 0 })));
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
