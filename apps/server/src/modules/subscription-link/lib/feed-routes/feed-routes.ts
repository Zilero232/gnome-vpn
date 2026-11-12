import { isNonNullish } from 'remeda';

import type { TunnelEndpoint } from '@/modules/peers';

import { isRelayLive } from '@/modules/status';

import type { FeedRoute, FeedRoutesInput, RelayAddress, RelayedNode, WireguardEndpointInput } from './feed-routes.types';

export const relayOf = (node: RelayAddress): TunnelEndpoint | null =>
  isNonNullish(node.relayHost) && isNonNullish(node.relayPort) ? { host: node.relayHost, port: node.relayPort } : null;

export const feedRoutes = <TNode extends RelayedNode>({ nodes, now }: FeedRoutesInput<TNode>): FeedRoute<TNode>[] =>
  nodes.map((node) => {
    const relay = relayOf(node);

    return relay && isRelayLive({ relayHealthyAt: node.relayHealthyAt, now }) ? { node, endpoint: relay } : { node };
  });

export const wireguardEndpoint = ({ node, now }: WireguardEndpointInput): TunnelEndpoint | undefined => {
  const relay = relayOf({ relayHost: node.relayHost, relayPort: node.relayWireguardPort });

  return relay && isRelayLive({ relayHealthyAt: node.relayHealthyAt, now }) ? relay : undefined;
};
