import type { AdminGiftState } from '@gnomevpn/schemas';

import { isNonNullish } from 'remeda';

import type { GiftStateInput } from './gift-state.types';

export const giftState = ({ isRevoked, redeemedAt }: GiftStateInput): AdminGiftState => {
  if (isRevoked) {
    return 'revoked';
  }

  return isNonNullish(redeemedAt) ? 'redeemed' : 'waiting';
};
