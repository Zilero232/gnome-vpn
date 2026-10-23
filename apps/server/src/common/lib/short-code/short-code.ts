import { SHORT_CODE } from '@gnomevpn/schemas';
import { randomInt } from 'node:crypto';

export const generateShortCode = (length: number = SHORT_CODE.length): string =>
  Array.from({ length }, () => SHORT_CODE.alphabet[randomInt(SHORT_CODE.alphabet.length)]).join('');
