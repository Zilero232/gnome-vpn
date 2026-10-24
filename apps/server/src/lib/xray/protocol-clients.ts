import { isNullish } from 'remeda';

import { AppServiceUnavailableException } from '@/common/exceptions';

import type { IssueClientInput, IssuedClient, PanelInbound, ProtocolClientsInput } from './xray.types';

import { serializeByKey } from './key-lock';
import { readSettings } from './xray.helpers';
import { PANEL_SCHEMA } from './xray.schemas';

export class ProtocolClients<TClient extends { email: string }> {
  constructor(private readonly options: ProtocolClientsInput<TClient>) {}

  async create({ email, credential, limitIp }: IssueClientInput): Promise<IssuedClient> {
    const { panel, remark, credentialOf, newClient } = this.options;

    return serializeByKey({
      key: panel.nodeKey,
      task: async () => {
        const inbound = await panel.inbound(remark);
        const existing = this.clientsIn(inbound).find((client) => client.email === email);

        if (existing) {
          await panel.setClientsEnabled({ emails: [email], enabled: true });

          return { nodeCredential: credentialOf(existing), email };
        }

        await panel.addClient({ inboundId: inbound.id, client: newClient({ email, credential, limitIp }) });

        return { nodeCredential: credential, email };
      }
    });
  }

  clientsIn(inbound: PanelInbound): TClient[] {
    const settings = readSettings({ inbound, schema: PANEL_SCHEMA.settings });

    if (isNullish(settings)) {
      throw new AppServiceUnavailableException('NODE_UNAVAILABLE', 'refusing to read an inbound whose settings could not be parsed');
    }

    return (settings.clients ?? []).flatMap((client) => {
      const parsed = this.options.schema.safeParse(client);

      return parsed.success ? [parsed.data] : [];
    });
  }
}
