import type { InboundSpec } from '../../../../apps/server/src/lib/xray';
import type { BuildWireguardInboundInput } from './wireguard-inbound.types';

import { WIREGUARD } from '../../../../apps/server/src/modules/peers/config';
import { PORTS } from '../../config';
import { WIREGUARD_INBOUND } from './wireguard-inbound.constants';

export const buildWireguardInbound = ({ secretKey }: BuildWireguardInboundInput): InboundSpec => ({
  tag: WIREGUARD_INBOUND.tag,
  listen: null,
  port: PORTS.wireguard,
  protocol: 'wireguard',
  settings: {
    secretKey,
    mtu: WIREGUARD.mtu,
    dns: '',
    peers: [],
    clients: [],
    noKernelTun: false,
    subnetIp: WIREGUARD_INBOUND.subnetIp,
    subnetCidr: WIREGUARD_INBOUND.subnetCidr
  }
});
