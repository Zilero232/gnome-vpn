import type { PromoDiscount } from '@gnomevpn/schemas';

export type PlanPriceProps = {
  priceRub: number;
  discount: PromoDiscount | null;
};
