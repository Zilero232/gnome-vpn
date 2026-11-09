import type { TunnelEndpoint } from '@/modules/peers';

export type RelayedNode = {
  relayHost: string | null;
  relayPort: number | null;
};

export type FeedRoute<TNode extends RelayedNode> = {
  node: TNode;
  endpoint?: TunnelEndpoint;
};
