import { sumBy } from 'remeda';

import type { RevenueSlice, RevenueSlicesInput, RevenueTotal } from './revenue-view.types';

export const revenueSlices = ({ revenueByPlan, revenueByKind, view }: RevenueSlicesInput): RevenueSlice[] =>
  view === 'plan'
    ? revenueByPlan.map(({ plan, amount, count }) => ({ key: plan, amount, count }))
    : revenueByKind.map(({ kind, amount, count }) => ({ key: kind, amount, count }));

export const revenueTotal = (slices: RevenueSlice[]): RevenueTotal => ({
  amount: sumBy(slices, (slice) => slice.amount),
  count: sumBy(slices, (slice) => slice.count)
});
