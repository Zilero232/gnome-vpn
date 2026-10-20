import type { PanelClient } from '../panel-client';
import type { CreateInboundInput, XrayInbound } from './inbounds.types';

import { INBOUND_REMARK } from './inbounds.constants';
import { inboundPayload, requireInbound } from './inbounds.helpers';

export class Inbounds {
  constructor(private readonly panel: PanelClient) {}

  list(): Promise<XrayInbound[]> {
    return this.panel.listInbounds();
  }

  async find(remark: string = INBOUND_REMARK): Promise<XrayInbound | undefined> {
    const inbounds = await this.list();

    return inbounds.find((inbound) => inbound.remark === remark);
  }

  async get(remark: string = INBOUND_REMARK): Promise<XrayInbound> {
    return requireInbound({ inbounds: await this.list(), remark });
  }

  async create({ inbound, remark = INBOUND_REMARK }: CreateInboundInput): Promise<void> {
    await this.panel.addInbound(inboundPayload({ inbound, remark }));
  }
}
