import { isNonNullish } from 'remeda';

import type { TunnelEndpoint } from '@/modules/peers';

import { isRelayLive } from '@/modules/status';

import type { FeedRoute, FeedRoutesInput, RelayedNode } from './feed-routes.types';

export const relayOf = (node: RelayedNode): TunnelEndpoint | null =>
  isNonNullish(node.relayHost) && isNonNullish(node.relayPort) ? { host: node.relayHost, port: node.relayPort } : null;

export const feedRoutes = <TNode extends RelayedNode>({ nodes, now }: FeedRoutesInput<TNode>): FeedRoute<TNode>[] =>
  nodes.map((node) => {
    const relay = relayOf(node);

    return relay && isRelayLive({ relayHealthyAt: node.relayHealthyAt, now }) ? { node, endpoint: relay } : { node };
  });
