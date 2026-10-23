import type { SELLER } from '@/shared/config';

export type Seller = typeof SELLER;

export type SellerField = keyof Seller;

export type SellerRow = {
  field: SellerField;
  value: string;
};
