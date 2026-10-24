import type { TunnelProtocol } from '@gnomevpn/schemas';

import { TUNNEL_PROTOCOL } from '@gnomevpn/schemas';

import { hasReality, hasWireguard } from '@/modules/peers';

import type { ProtocolNode } from './node-protocols.types';

export const nodeProtocols = (node: ProtocolNode): TunnelProtocol[] => [
  TUNNEL_PROTOCOL.hysteria2,
  ...(hasReality(node) ? [TUNNEL_PROTOCOL.vless] : []),
  ...(hasWireguard(node) ? [TUNNEL_PROTOCOL.wireguard] : [])
];
