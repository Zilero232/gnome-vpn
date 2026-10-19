import type { WireguardNode } from '@gnomevpn/schemas';

import type { WireguardConfInput, WireguardFileNameInput, WireguardNodeSource } from './wireguard-conf.types';

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

export const wireguardFileName = ({ countryCode, deviceId }: WireguardFileNameInput): string => {
  const country = countryCode.toLowerCase().replaceAll(/[^a-z]/gu, '');
  const id = deviceId.replaceAll('-', '').slice(0, WIREGUARD_CONF.fileIdLength);

  return `${WIREGUARD_CONF.filePrefix}-${country}-${id}${WIREGUARD_CONF.fileExtension}`;
};

export const wireguardNodeView = ({ id, country, countryCode, city }: WireguardNodeSource): WireguardNode => ({ id, country, countryCode, city });
