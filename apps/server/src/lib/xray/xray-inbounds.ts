import { Logger } from '@nestjs/common';
import { isNullish } from 'remeda';

import { AppServiceUnavailableException } from '@/common/exceptions';

import type { InboundInput, PanelAccess, PanelInbound, RewriteInboundInput } from './xray.types';

import { coalesceByKey, serializeByKey } from './key-lock';
import { PanelClient } from './panel-client';
import { WireguardClients } from './wireguard-clients';
import { inboundPayload, readClients } from './xray.helpers';

export class XrayInbounds {
  private static readonly logger = new Logger(XrayInbounds.name);

  private readonly panel: PanelClient;

  constructor(access: PanelAccess) {
    this.panel = new PanelClient(access);
  }

  list(): Promise<PanelInbound[]> {
    return this.panel.listInbounds();
  }

  async isReachable(): Promise<boolean> {
    try {
      await this.panel.listInbounds();

      return true;
    } catch (error) {
      XrayInbounds.logger.warn(`node ${this.panel.host} unreachable: ${error}`);

      return false;
    }
  }

  create({ inbound, remark }: InboundInput): Promise<void> {
    return this.panel.addInbound(inboundPayload({ inbound, remark }));
  }

  update({ inbound, remark }: InboundInput): Promise<void> {
    return serializeByKey({
      key: this.panel.nodeKey,
      task: async () => {
        const current = await this.panel.inbound(remark);

        await this.rewrite({ current, inbound, remark });
      }
    });
  }

  ensure({ inbound, remark }: InboundInput): Promise<void> {
    return serializeByKey({
      key: this.panel.nodeKey,
      task: async () => {
        const current = await this.panel.findInbound(remark);

        if (isNullish(current)) {
          await this.panel.addInbound(inboundPayload({ inbound, remark }));

          return;
        }

        await this.rewrite({ current, inbound, remark });
      }
    });
  }

  async wireguardEmails(): Promise<string[]> {
    const clients = await new WireguardClients(this.panel).list();

    return clients.map((client) => client.email);
  }

  restartCore(reason: string): Promise<void> {
    return coalesceByKey({
      key: this.panel.nodeKey,
      task: () => {
        XrayInbounds.logger.log(`restarting the core on ${this.panel.host}: ${reason}`);

        return this.panel.restartCore();
      }
    });
  }

  private async rewrite({ current, inbound, remark }: RewriteInboundInput): Promise<void> {
    const clients = readClients(current);

    if (isNullish(clients)) {
      throw new AppServiceUnavailableException('NODE_UNAVAILABLE', 'refusing to rewrite an inbound whose clients could not be read');
    }

    await this.panel.updateInbound({
      id: current.id,
      payload: inboundPayload({ inbound: { ...inbound, settings: { ...inbound.settings, clients } }, remark })
    });
  }
}
