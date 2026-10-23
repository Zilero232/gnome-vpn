import type { GiftList, PendingDiscount, PromoRedemption, RedeemPromoCodeInput } from '@gnomevpn/schemas';

import { api } from '../http';

export const redeemPromoCode = async (input: RedeemPromoCodeInput): Promise<PromoRedemption> => {
  const { data } = await api.post('/promo-codes/redeem', input);

  return data;
};

export const getPendingDiscount = async (): Promise<PendingDiscount> => {
  const { data } = await api.get('/promo-codes/discount');

  return data;
};

export const getGifts = async (): Promise<GiftList> => {
  const { data } = await api.get('/promo-codes/gifts');

  return data;
};
