import type { InboundSpec, PanelInbound } from '../../../../apps/server/src/lib/xray';

export type PanelCredentials = {
  baseUrl: string;
  token: string;
};

export type DesiredInbound = InboundSpec;

export type DesiredInbounds = {
  hysteria: DesiredInbound;
  vless: DesiredInbound;
  wireguard: DesiredInbound;
};

export type SyncInboundsInput = PanelCredentials & {
  inbounds: DesiredInbounds;
};

export type InboundChange = 'created' | 'unchanged' | 'updated';

export type EnsureInboundInput = {
  label: string;
  current: PanelInbound | undefined;
  desired: DesiredInbound;
  create: () => Promise<void>;
  update: () => Promise<void>;
};

export type InboundMatchesInput = {
  current: PanelInbound;
  desired: DesiredInbound;
};

export type CoversInput = {
  wanted: unknown;
  actual: unknown;
};
