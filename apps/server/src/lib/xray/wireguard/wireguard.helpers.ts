import type { WireguardClient } from './wireguard.types';

import { WIREGUARD_HOST_MASK } from './wireguard.constants';

export const hostOf = (cidr: string): string => cidr.split('/')[0] ?? cidr;

export const addressOf = (client: WireguardClient | undefined): string | null => {
  const [first] = client?.allowedIPs ?? [];

  return first ? hostOf(first) : null;
};

export const hostRoute = (address: string): string => `${hostOf(address)}${WIREGUARD_HOST_MASK}`;
