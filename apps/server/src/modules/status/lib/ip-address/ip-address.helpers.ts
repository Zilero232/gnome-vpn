import type { MappedIpv4Input } from './ip-address.types';

const BYTE = 255;

export const mappedIpv4 = ({ high, low }: MappedIpv4Input): string => {
  const [hi, lo] = [Number.parseInt(high, 16), Number.parseInt(low, 16)];

  return [hi >> 8, hi & BYTE, lo >> 8, lo & BYTE].join('.');
};
