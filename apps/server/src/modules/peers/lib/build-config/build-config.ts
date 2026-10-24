import type { TunnelConfig } from '@gnomevpn/schemas';

import { TUNNEL_PROTOCOL } from '@gnomevpn/schemas';
import { match } from 'ts-pattern';

import { AppServiceUnavailableException } from '@/common/exceptions';
import { hostRoute } from '@/lib/xray';
import { REALITY, TUNNEL, WIREGUARD } from '@/modules/peers/config';

import type { BuildConfigInput } from './build-config.types';

import { hasReality, hasWireguard } from './build-config.helpers';

const buildHysteria2Config = ({ node, auth }: BuildConfigInput): TunnelConfig => ({
  protocol: TUNNEL_PROTOCOL.hysteria2,
  server: node.host,
  port: node.port,
  auth,
  serverName: node.serverName,
  insecure: TUNNEL.insecure,
  certFingerprint: node.certFingerprint ?? '',
  dns: [...TUNNEL.dns]
});

const buildVlessConfig = ({ node, auth }: BuildConfigInput): TunnelConfig => {
  if (!hasReality(node)) {
    throw new AppServiceUnavailableException('NODE_UNAVAILABLE', 'node has no reality endpoint');
  }

  return {
    protocol: TUNNEL_PROTOCOL.vless,
    server: node.host,
    port: REALITY.listenPort,
    auth,
    serverName: node.serverName,
    insecure: false,
    certFingerprint: '',
    dns: [...TUNNEL.dns],
    reality: {
      publicKey: node.realityPublicKey,
      shortId: node.realityShortId,
      fingerprint: REALITY.fingerprint,
      flow: REALITY.flow,
      serviceName: REALITY.serviceName
    }
  };
};

const buildWireguardConfig = ({ node, auth, address }: BuildConfigInput): TunnelConfig => {
  if (!hasWireguard(node) || !address) {
    throw new AppServiceUnavailableException('NODE_UNAVAILABLE', 'node has no wireguard endpoint or the peer no address');
  }

  return {
    protocol: TUNNEL_PROTOCOL.wireguard,
    server: node.host,
    port: WIREGUARD.listenPort,
    auth,
    serverName: node.serverName,
    insecure: false,
    certFingerprint: '',
    dns: [...TUNNEL.dns],
    wireguard: {
      publicKey: node.wgPublicKey,
      address: hostRoute(address),
      mtu: WIREGUARD.mtu
    }
  };
};

export const buildTunnelConfig = (input: BuildConfigInput): TunnelConfig =>
  match(input.protocol)
    .with(TUNNEL_PROTOCOL.vless, () => buildVlessConfig(input))
    .with(TUNNEL_PROTOCOL.wireguard, () => buildWireguardConfig(input))
    .otherwise(() => buildHysteria2Config(input));
