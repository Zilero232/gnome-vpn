import { isNonNullish } from 'remeda';

import type { GiftState, GiftStateInput } from './gift-state.types';

export const giftState = ({ isRevoked, redeemedAt }: GiftStateInput): GiftState => {
  if (isRevoked) {
    return 'revoked';
  }

  return isNonNullish(redeemedAt) ? 'redeemed' : 'waiting';
};
