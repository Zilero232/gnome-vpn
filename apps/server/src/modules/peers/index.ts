export { PEER_PREFIX, PEER_REF_SELECT, WIREGUARD } from './config';
export {
  buildTunnelConfig,
  generateRealityKeys,
  generateRealityShortId,
  generateWireguardKeys,
  hasReality,
  hasWireguard,
  isWireguardClient,
  peerClientName,
  wireguardPublicKey
} from './lib';
export type { TunnelNode } from './lib';
export { PeersModule } from './peers.module';

export type { CreatedPeer, PeerRef } from './peers.service.types';
export { PeersService } from './services';
