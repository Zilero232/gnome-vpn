import type { TunnelEndpoint } from '@/modules/peers';

export type RelayedNode = {
  relayHost: string | null;
  relayPort: number | null;
  relayHealthyAt: Date | null;
};

export type FeedRoute<TNode extends RelayedNode> = {
  node: TNode;
  endpoint?: TunnelEndpoint;
};

export type FeedRoutesInput<TNode extends RelayedNode> = {
  nodes: TNode[];
  now: Date;
};
