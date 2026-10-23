import { entries, isNonNullish } from 'remeda';

import type { Seller, SellerRow } from './seller-rows.types';

export const sellerRows = (seller: Seller): SellerRow[] =>
  entries(seller).flatMap(([field, value]) => (isNonNullish(value) ? [{ field, value }] : []));
