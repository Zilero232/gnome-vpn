import type { PromoRedemption } from '@gnomevpn/schemas';

import type { RedeemedMessage } from './redeemed-message.types';

export const redeemedMessage = ({ kind, percent, days }: PromoRedemption): RedeemedMessage => ({
  key: `redeemed.${kind}`,
  values: { percent: percent ?? 0, days: days ?? 0 }
});
