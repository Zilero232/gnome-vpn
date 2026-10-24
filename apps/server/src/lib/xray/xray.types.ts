import type { XrayInbound } from './inbounds';

export type XrayClientOptions = {
  baseUrl: string;
  token: string;
};

export type IssueClientInput = {
  email: string;
  limitIp: number;
  auth?: string;
};

export type IssueVlessClientInput = {
  email: string;
  limitIp: number;
  id?: string;
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

export type RewriteInboundInput = {
  current: XrayInbound;
  inbound: Record<string, unknown>;
  remark?: string;
};

export type EnsureInboundInput = {
  inbound: Record<string, unknown>;
  remark: string;
};

export type NodeAccess = {
  apiUrl: string;
  apiTokenEnvVar: string;
};

export type IdentifiedNode = NodeAccess & {
  id: string;
};
