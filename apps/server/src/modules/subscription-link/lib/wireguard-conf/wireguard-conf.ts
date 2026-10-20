import type { WireguardConfInput } from './wireguard-conf.types';

import { WIREGUARD_CONF } from './wireguard-conf.constants';

export const wireguardConf = ({ privateKey, address, dns, mtu, serverPublicKey, host, port, keepAlive }: WireguardConfInput): string =>
  [
    '[Interface]',
    `PrivateKey = ${privateKey}`,
    `Address = ${address}`,
    `DNS = ${dns.join(', ')}`,
    `MTU = ${mtu}`,
    '',
    '[Peer]',
    `PublicKey = ${serverPublicKey}`,
    `AllowedIPs = ${WIREGUARD_CONF.allowedIps}`,
    `Endpoint = ${host}:${port}`,
    `PersistentKeepalive = ${keepAlive}`,
    ''
  ].join('\n');
