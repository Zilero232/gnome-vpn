import { isEmpty } from 'remeda';
import { z } from 'zod';

import { AppServiceUnavailableException } from '@/common/exceptions';

import type {
  AddClientInput,
  InboundPayload,
  PanelAccess,
  PanelClientStat,
  PanelCommandInput,
  PanelInbound,
  PanelRequestInput,
  PanelServerStatus,
  SetClientsEnabledInput,
  UpdateClientInput,
  UpdateInboundInput
} from './xray.types';

import { CLIENT_DEFAULTS, PANEL } from './xray.constants';
import { collectLastOnline, collectOnlineEmails, requireInbound } from './xray.helpers';
import { PANEL_SCHEMA } from './xray.schemas';

export class PanelClient {
  readonly nodeKey: string;
  private readonly token: string;

  constructor({ baseUrl, token }: PanelAccess) {
    this.nodeKey = baseUrl.replace(/\/$/, '');
    this.token = token;
  }

  get host(): string {
    return new URL(this.nodeKey).host;
  }

  private async request<T>({ method, path, schema, body }: PanelRequestInput<T>): Promise<T> {
    const response = await fetch(`${this.nodeKey}${path}`, {
      method,
      signal: AbortSignal.timeout(PANEL.requestTimeoutMs),
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new AppServiceUnavailableException('NODE_UNAVAILABLE', `panel ${path} returned ${response.status}`);
    }

    const envelope = PANEL_SCHEMA.response.safeParse(await response.json());

    if (!envelope.success) {
      throw new AppServiceUnavailableException('NODE_UNAVAILABLE', `panel ${path} answered something other than a panel response`);
    }

    if (!envelope.data.success) {
      throw new AppServiceUnavailableException('NODE_UNAVAILABLE', `panel ${path}: ${envelope.data.msg}`);
    }

    const result = schema.safeParse(envelope.data.obj);

    if (!result.success) {
      throw new AppServiceUnavailableException('NODE_UNAVAILABLE', `panel ${path} answered an unexpected shape`);
    }

    return result.data;
  }

  private async command({ path, body }: PanelCommandInput): Promise<void> {
    await this.request({ method: 'POST', path, body, schema: z.unknown() });
  }

  listInbounds(): Promise<PanelInbound[]> {
    return this.request({ method: 'GET', path: PANEL.routes.listInbounds, schema: z.array(PANEL_SCHEMA.inbound) });
  }

  async findInbound(remark: string): Promise<PanelInbound | undefined> {
    const inbounds = await this.listInbounds();

    return inbounds.find((inbound) => inbound.remark === remark);
  }

  async inbound(remark: string): Promise<PanelInbound> {
    return requireInbound({ inbounds: await this.listInbounds(), remark });
  }

  addInbound(payload: InboundPayload): Promise<void> {
    return this.command({ path: PANEL.routes.addInbound, body: payload });
  }

  updateInbound({ id, payload }: UpdateInboundInput): Promise<void> {
    return this.command({ path: PANEL.routes.updateInbound(id), body: payload });
  }

  restartCore(): Promise<void> {
    return this.command({ path: PANEL.routes.restartCore });
  }

  serverStatus(): Promise<PanelServerStatus> {
    return this.request({ method: 'GET', path: PANEL.routes.serverStatus, schema: PANEL_SCHEMA.serverStatus });
  }

  async clientTraffic(): Promise<PanelClientStat[]> {
    const inbounds = await this.listInbounds();

    return inbounds.flatMap((inbound) => inbound.clientStats ?? []);
  }

  addClient({ inboundId, client }: AddClientInput): Promise<void> {
    return this.command({ path: PANEL.routes.addClient, body: { inboundIds: [inboundId], client: { ...client, ...CLIENT_DEFAULTS } } });
  }

  updateClient({ email, client }: UpdateClientInput): Promise<void> {
    return this.command({ path: PANEL.routes.updateClient(email), body: client });
  }

  deleteClient(email: string): Promise<void> {
    return this.command({ path: PANEL.routes.deleteClient(email) });
  }

  async setClientsEnabled({ emails, enabled }: SetClientsEnabledInput): Promise<void> {
    if (isEmpty(emails)) {
      return;
    }

    await this.command({ path: PANEL.routes.setEnabled(enabled), body: { emails } });
  }

  async onlineEmails(): Promise<Set<string> | null> {
    return collectOnlineEmails(await this.request({ method: 'POST', path: PANEL.routes.onlines, schema: PANEL_SCHEMA.onlines }));
  }

  async lastOnline(): Promise<Map<string, Date>> {
    return collectLastOnline(await this.request({ method: 'POST', path: PANEL.routes.lastOnline, schema: PANEL_SCHEMA.lastOnline }));
  }
}
