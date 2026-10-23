import type { TunnelProtocol } from '@gnomevpn/schemas';

import { TUNNEL_PROTOCOL } from '@gnomevpn/schemas';

import type { ProtocolNode } from './node-protocols.types';

import { hasReality, hasWireguard } from '../../../peers';

export const nodeProtocols = (node: ProtocolNode): TunnelProtocol[] => [
  TUNNEL_PROTOCOL.hysteria2,
  ...(hasReality(node) ? [TUNNEL_PROTOCOL.vless] : []),
  ...(hasWireguard(node) ? [TUNNEL_PROTOCOL.wireguard] : [])
];
