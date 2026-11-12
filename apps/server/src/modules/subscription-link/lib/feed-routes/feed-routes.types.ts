import type { TunnelEndpoint } from '@/modules/peers';

export type RelayAddress = {
  relayHost: string | null;
  relayPort: number | null;
};

export type RelayedNode = RelayAddress & {
  relayHealthyAt: Date | null;
};

export type WireguardRelayNode = {
  relayHost: string | null;
  relayWireguardPort: number | null;
  relayHealthyAt: Date | null;
};

export type WireguardEndpointInput = {
  node: WireguardRelayNode;
  now: Date;
};

export type FeedRoute<TNode extends RelayedNode> = {
  node: TNode;
  endpoint?: TunnelEndpoint;
};

export type FeedRoutesInput<TNode extends RelayedNode> = {
  nodes: TNode[];
  now: Date;
};
