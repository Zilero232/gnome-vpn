import { isNonNullish } from 'remeda';

import type { TunnelEndpoint } from '@/modules/peers';

import type { FeedRoute, RelayedNode } from './feed-routes.types';

export const relayOf = (node: RelayedNode): TunnelEndpoint | null =>
  isNonNullish(node.relayHost) && isNonNullish(node.relayPort) ? { host: node.relayHost, port: node.relayPort } : null;

export const feedRoutes = <TNode extends RelayedNode>(nodes: TNode[]): FeedRoute<TNode>[] =>
  nodes.map((node) => {
    const relay = relayOf(node);

    return relay ? { node, endpoint: relay } : { node };
  });
