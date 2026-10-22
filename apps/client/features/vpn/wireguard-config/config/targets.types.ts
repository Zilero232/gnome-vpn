import type { WIREGUARD_TARGETS } from './targets';

export type WireguardTarget = (typeof WIREGUARD_TARGETS)[number]['id'];
