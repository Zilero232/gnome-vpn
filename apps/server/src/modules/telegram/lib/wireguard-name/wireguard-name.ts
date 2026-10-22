import { range } from 'remeda';

import type { WireguardNameInput } from './wireguard-name.types';

import { FIRST_SUFFIX } from './wireguard-name.constants';

export const wireguardName = ({ base, taken }: WireguardNameInput): string => {
  const used = new Set(taken);
  const numbered = range(FIRST_SUFFIX, FIRST_SUFFIX + taken.length + 1).map((suffix) => `${base} ${suffix}`);

  return [base, ...numbered].find((candidate) => !used.has(candidate)) ?? base;
};
