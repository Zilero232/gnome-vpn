import { createHmac } from 'node:crypto';

import type { ReadUnsubscribeInput, SignUnsubscribeInput } from './unsubscribe-token.types';

import { timingSafeEqual } from '../../../../common/lib';
import { UNSUBSCRIBE_TOKEN } from './unsubscribe-token.constants';

const signatureOf = ({ userId, secret }: SignUnsubscribeInput): string =>
  createHmac(UNSUBSCRIBE_TOKEN.algorithm, secret).update(`${UNSUBSCRIBE_TOKEN.purpose}${userId}`).digest(UNSUBSCRIBE_TOKEN.encoding);

export const signUnsubscribe = ({ userId, secret }: SignUnsubscribeInput): string =>
  `${userId}${UNSUBSCRIBE_TOKEN.separator}${signatureOf({ userId, secret })}`;

export const readUnsubscribe = ({ token, secret }: ReadUnsubscribeInput): string | null => {
  const cut = token.lastIndexOf(UNSUBSCRIBE_TOKEN.separator);

  if (cut <= 0) {
    return null;
  }

  const userId = token.slice(0, cut);
  const signature = token.slice(cut + 1);

  return timingSafeEqual({ actual: signature, expected: signatureOf({ userId, secret }) }) ? userId : null;
};
