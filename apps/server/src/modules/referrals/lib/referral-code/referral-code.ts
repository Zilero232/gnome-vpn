import { REFERRAL_CODE } from '@gnomevpn/schemas';
import { randomInt } from 'node:crypto';

export const generateReferralCode = (): string =>
  Array.from({ length: REFERRAL_CODE.length }, () => REFERRAL_CODE.alphabet[randomInt(REFERRAL_CODE.alphabet.length)]).join('');
