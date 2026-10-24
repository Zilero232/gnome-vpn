import { canonicalIp } from '@/common/lib';

import type { CountryForIpInput } from './ip-address.types';

export const countryForIp = ({ addresses, ip }: CountryForIpInput): string | null => {
  const target = canonicalIp(ip);

  if (target === null) {
    return null;
  }

  return addresses.find(({ address }) => canonicalIp(address) === target)?.countryCode ?? null;
};
