import type { AdminGrowth } from '@gnomevpn/schemas';

export type GrowthBlockProps = {
  growth: AdminGrowth;
  period: number;
  isFaded: boolean;
};
