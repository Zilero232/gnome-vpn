import type { XrayInbound } from '../inbounds';
import type { ProtocolClientsDeps } from '../protocol-clients';
import type { CreateVlessClientInput, CreateVlessClientResult, VlessClient } from './vless.types';

import { ProtocolClients } from '../protocol-clients';
import { VLESS_INBOUND_REMARK } from './vless.constants';

export class VlessClients {
  private readonly clients: ProtocolClients<VlessClient>;

  constructor({ panel, inbounds, nodeKey }: ProtocolClientsDeps) {
    this.clients = new ProtocolClients<VlessClient>({
      panel,
      inbounds,
      nodeKey,
      remark: VLESS_INBOUND_REMARK,
      credentialOf: (client) => client.id,
      add: ({ inboundId, email, credential, limitIp }) => panel.addVlessClient({ inboundId, email, id: credential, limitIp })
    });
  }

  async list(): Promise<VlessClient[]> {
    return this.clients.list();
  }

  clientsIn(inbound: XrayInbound): VlessClient[] {
    return this.clients.clientsIn(inbound);
  }

  async create({ email, id, limitIp }: CreateVlessClientInput): Promise<CreateVlessClientResult> {
    return this.clients.create({ email, credential: id, limitIp });
  }
}
