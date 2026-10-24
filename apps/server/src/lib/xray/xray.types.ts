import type { z } from 'zod';

import type { Prisma } from '@/generated';

import type { IDENTIFIED_NODE_SELECT, NODE_ACCESS_SELECT } from './node-access';
import type { PanelClient } from './panel-client';
import type { CLIENT_SCHEMA, PANEL_SCHEMA } from './xray.schemas';

export type NodeAccess = Prisma.NodeGetPayload<{ select: typeof NODE_ACCESS_SELECT }>;

export type IdentifiedNode = Prisma.NodeGetPayload<{ select: typeof IDENTIFIED_NODE_SELECT }>;

export type PanelAccess = {
  baseUrl: string;
  token: string;
};

export type PanelInbound = z.infer<typeof PANEL_SCHEMA.inbound>;

export type PanelClientStat = NonNullable<PanelInbound['clientStats']>[number];

export type PanelServerStatus = z.infer<typeof PANEL_SCHEMA.serverStatus>;

export type PanelResourceUsage = PanelServerStatus['mem'];

export type PanelOnlines = z.infer<typeof PANEL_SCHEMA.onlines>;

export type PanelLastOnline = z.infer<typeof PANEL_SCHEMA.lastOnline>;

export type HysteriaClient = z.infer<typeof CLIENT_SCHEMA.hysteria>;

export type VlessClient = z.infer<typeof CLIENT_SCHEMA.vless>;

export type WireguardClient = z.infer<typeof CLIENT_SCHEMA.wireguard>;

export type InboundSpec = {
  tag: string;
  listen: string | null;
  port: number;
  protocol: string;
  settings: Record<string, unknown>;
  streamSettings?: Record<string, unknown>;
  sniffing?: Record<string, unknown>;
};

export type InboundPayload = Omit<InboundSpec, 'settings' | 'sniffing' | 'streamSettings'> & {
  remark: string;
  enable: boolean;
  settings: string;
  streamSettings: string;
  sniffing: string;
};

export type InboundInput = {
  inbound: InboundSpec;
  remark: string;
};

export type RewriteInboundInput = InboundInput & {
  current: PanelInbound;
};

export type RequireInboundInput = {
  inbounds: PanelInbound[];
  remark: string;
};

export type UpdateInboundInput = {
  id: number;
  payload: InboundPayload;
};

export type ReadSettingsInput<T> = {
  inbound: PanelInbound;
  schema: z.ZodType<T>;
};

export type PanelRequestInput<T> = {
  method: 'GET' | 'POST';
  path: string;
  schema: z.ZodType<T>;
  body?: unknown;
};

export type PanelCommandInput = {
  path: string;
  body?: unknown;
};

export type NewPanelClient = {
  email: string;
  limitIp: number;
} & ({ auth: string } | { id: string; flow: string } | { privateKey: string; publicKey: string; keepAlive: number; allowedIPs?: string[] });

export type AddClientInput = {
  inboundId: number;
  client: NewPanelClient;
};

export type SetClientsEnabledInput = {
  emails: string[];
  enabled: boolean;
};

export type KeyedTaskInput<T> = {
  key: string;
  task: () => Promise<T>;
};

export type CoalesceSlot = {
  running: Promise<void>;
  next: Promise<void> | null;
};

export type IssueClientInput = {
  email: string;
  credential: string;
  limitIp: number;
};

export type IssueHysteriaClientInput = {
  email: string;
  limitIp: number;
  auth?: string;
};

export type IssueVlessClientInput = {
  email: string;
  limitIp: number;
  id?: string;
};

export type IssuedClient = {
  nodeCredential: string;
  email: string;
};

export type ProtocolClientsInput<TClient> = {
  panel: PanelClient;
  remark: string;
  schema: z.ZodType<TClient>;
  credentialOf: (client: TClient) => string;
  newClient: (input: IssueClientInput) => NewPanelClient;
};

export type CreateWireguardClientInput = {
  email: string;
  privateKey: string;
  publicKey: string;
  limitIp: number;
  address?: string | null;
};

export type IssuedWireguardClient = IssuedClient & {
  address: string;
};

export type AddWireguardClientInput = {
  inboundId: number;
  email: string;
  privateKey: string;
  publicKey: string;
  limitIp: number;
  address: string | null | undefined;
};

export type ReaddWireguardClientInput = {
  inboundId: number;
  client: WireguardClient;
};

export type NodeTraffic = {
  up: number;
  down: number;
};

export type NodeHealth = {
  isHealthy: boolean;
  cpu: number | null;
  memoryRatio: number | null;
  tcpCount: number | null;
};
