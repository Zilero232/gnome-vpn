import { SHORT_CODE } from '@gnomevpn/schemas';
import { timingSafeEqual as nodeTimingSafeEqual, randomInt } from 'node:crypto';

import type { TimingSafeEqualInput } from './crypto.types';

export const generateShortCode = (length: number = SHORT_CODE.length): string =>
  Array.from({ length }, () => SHORT_CODE.alphabet[randomInt(SHORT_CODE.alphabet.length)]).join('');

export const timingSafeEqual = ({ actual, expected }: TimingSafeEqualInput): boolean => {
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);

  if (a.length !== b.length) {
    return false;
  }

  return nodeTimingSafeEqual(a, b);
};
