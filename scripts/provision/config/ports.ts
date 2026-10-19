import { WIREGUARD } from '../../../apps/server/src/modules/peers/config';

// Hysteria2 takes 443/udp and Reality 443/tcp: one is UDP and the other TCP, so
// they share the number without conflicting.
export const PORTS = {
  hysteria: 443,
  reality: 443,
  wireguard: WIREGUARD.listenPort,
  panel: 2053
} as const;
