import { isIP } from 'node:net';

import type { CountryForIpInput } from './ip-address.types';

import { IP_FAMILY, IPV4_MAPPED } from './ip-address.constants';
import { mappedIpv4 } from './ip-address.helpers';

export const isIpAddress = (value: string): boolean => isIP(value) !== IP_FAMILY.none;

export const canonicalIp = (ip: string): string | null => {
  const family = isIP(ip);
  const url = `http://${family === IP_FAMILY.v6 ? `[${ip}]` : ip}`;

  if (family === IP_FAMILY.none || !URL.canParse(url)) {
    return null;
  }

  const { hostname } = new URL(url);

  if (family !== IP_FAMILY.v6) {
    return hostname;
  }

  const address = hostname.slice(1, -1);
  const mapped = IPV4_MAPPED.exec(address);

  return mapped ? mappedIpv4({ high: mapped[1], low: mapped[2] }) : address;
};

export const countryForIp = ({ addresses, ip }: CountryForIpInput): string | null => {
  const target = canonicalIp(ip);

  if (target === null) {
    return null;
  }

  return addresses.find(({ address }) => canonicalIp(address) === target)?.countryCode ?? null;
};
