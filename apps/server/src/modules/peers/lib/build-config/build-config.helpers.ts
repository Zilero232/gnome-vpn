import { isNonNullish } from 'remeda';

import type { RealityNode, ResolvedRealityNode, ResolvedWireguardNode, WireguardNode } from './build-config.types';

export const hasReality = <T extends RealityNode>(node: T): node is ResolvedRealityNode<T> =>
  isNonNullish(node.realityPublicKey) && isNonNullish(node.realityShortId);

export const hasWireguard = <T extends WireguardNode>(node: T): node is ResolvedWireguardNode<T> => isNonNullish(node.wgPublicKey);
