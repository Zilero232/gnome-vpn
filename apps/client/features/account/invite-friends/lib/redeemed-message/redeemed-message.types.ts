import type { PromoRedemptionKind } from '@gnomevpn/schemas';

export type RedeemedMessage = {
  key: `redeemed.${PromoRedemptionKind}`;
  values: Record<string, number>;
};
