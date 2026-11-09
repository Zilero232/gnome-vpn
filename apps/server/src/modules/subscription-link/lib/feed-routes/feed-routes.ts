import { isNonNullish } from 'remeda';

import type { TunnelEndpoint } from '@/modules/peers';

import type { FeedRoute, RelayedNode } from './feed-routes.types';

import { FEED_ROUTE } from './feed-routes.constants';

export const relayOf = (node: RelayedNode): TunnelEndpoint | null =>
  isNonNullish(node.relayHost) && isNonNullish(node.relayPort) ? { host: node.relayHost, port: node.relayPort } : null;

const primaryRoute = <TNode extends RelayedNode>(node: TNode): FeedRoute<TNode> => {
  const relay = relayOf(node);

  return relay ? { node, endpoint: relay } : { node };
};

const fallbackRoutes = <TNode extends RelayedNode>(node: TNode): FeedRoute<TNode>[] =>
  relayOf(node) ? [{ node, suffix: FEED_ROUTE.directSuffix }] : [];

export const feedRoutes = <TNode extends RelayedNode>(nodes: TNode[]): FeedRoute<TNode>[] => [
  ...nodes.map(primaryRoute),
  ...nodes.flatMap(fallbackRoutes)
];
