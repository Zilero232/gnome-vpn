import type { TunnelProtocol, UpdateRoutingSettingsInput } from '@gnomevpn/schemas';

import type { Prisma } from '@/generated';
import type { NodeTraffic } from '@/lib/xray';

import type { DeviceHeaders, DeviceIdentity } from '../devices';
import type { GeoKind, TlsMode } from './lib';

export type SubscriptionNode = {
  id: string;
  country: string;
  countryCode: string;
  city: string | null;
  host: string;
  port: number;
  serverName: string;
  certFingerprint: string | null;
  apiUrl: string;
  apiTokenEnvVar: string;
  realityPublicKey: string | null;
  realityShortId: string | null;
  wgPublicKey: string | null;
  createdAt: Date;
  lastHealthyAt: Date | null;
};

export type FeedPeer = {
  protocol: TunnelProtocol;
  nodeCredential: string;
  tunnelAddress: string | null;
};

export type SubscriptionBody = {
  body: string;
  headers: Record<string, string>;
};

export type BuildFeedInput = {
  token: string;
  headers: DeviceHeaders;
};

export type TouchLinkInput = {
  token: string;
  userAgent: string | null;
};

export type ServerUrisInput = {
  userId: string;
  deviceId: string;
  nodes: SubscriptionNode[];
  tls: TlsMode;
  issuable: Set<string>;
  limitIp: number;
};

export type EnsureNodeInput = {
  userId: string;
  deviceId: string;
  node: SubscriptionNode;
  canIssue: boolean;
  limitIp?: number;
  protocols?: TunnelProtocol[];
};

export type IssueFeedPeerInput = Omit<EnsureNodeInput, 'canIssue' | 'limitIp' | 'protocols'> & {
  protocol: TunnelProtocol;
  limitIp: number;
};

export type PersistPeerInput = {
  userId: string;
  deviceId: string;
  name: string;
  nodeId: string;
  protocol: TunnelProtocol;
  nodeCredential: string;
  tunnelAddress: string | null;
};

export type RecordNodeTrafficInput = {
  nodeId: string;
  traffic: Map<string, NodeTraffic>;
};

export type TrafficClient = {
  nodeId: string;
  email: string;
};

export type SetEnabledAllInput = {
  userId: string;
  enabled: boolean;
  owner?: Prisma.UserWhereInput;
};

export type PresentLinkInput = {
  token: string;
  createdAt: Date;
};

export type DeviceAddedInput = {
  userId: string;
  identity: DeviceIdentity;
  deviceCount: number;
  deviceLimit: number;
};

export type DeviceBlockedInput = {
  token: string;
  userId: string;
  identity: DeviceIdentity;
  deviceLimit: number;
};

export type CreateWireguardConfigServiceInput = {
  userId: string;
  nodeId: string;
  name: string;
  shouldAnnounce?: boolean;
};

export type WireguardConfigFileInput = {
  userId: string;
  deviceId: string;
};

export type RenderConfigInput = {
  deviceId: string;
  name: string | null;
  node: SubscriptionNode;
  peer: FeedPeer;
};

export type UpdateRoutingSettingsServiceInput = {
  userId: string;
  patch: UpdateRoutingSettingsInput;
};

export type GeoFile = {
  data: Buffer;
  sha256: string;
  builtAt: Date;
};

export type GeoFileSet = Record<GeoKind, GeoFile>;
