import type { AdminAnalytics } from '@gnomevpn/schemas';

import { paymentKindSchema, PLANS } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { revenueSlices, revenueTotal } from '../revenue-view';

const split: Pick<AdminAnalytics, 'revenueByKind' | 'revenueByPlan'> = {
  revenueByPlan: PLANS.map((plan, index) => ({ plan: plan.id, amount: plan.priceRub * index, count: index })),
  revenueByKind: paymentKindSchema.options.map((kind, index) => ({ kind, amount: 100 * (index + 1), count: index + 1 }))
};

describe('revenueSlices', () => {
  it('lists every plan in the plan view and every kind in the kind view, in the order the server sent them', () => {
    expect(revenueSlices({ ...split, view: 'plan' }).map((slice) => slice.key)).toEqual(PLANS.map((plan) => plan.id));
    expect(revenueSlices({ ...split, view: 'kind' }).map((slice) => slice.key)).toEqual(paymentKindSchema.options);
  });
});

describe('revenueTotal', () => {
  it('adds up the amounts and the counts of the view it is given', () => {
    const slices = revenueSlices({ ...split, view: 'kind' });

    expect(revenueTotal(slices)).toEqual({
      amount: split.revenueByKind.reduce((sum, slice) => sum + slice.amount, 0),
      count: split.revenueByKind.reduce((sum, slice) => sum + slice.count, 0)
    });
  });

  it('is zero for a period without payments, which is what the empty state keys on', () => {
    expect(revenueTotal(revenueSlices({ revenueByPlan: [], revenueByKind: [], view: 'plan' }))).toEqual({ amount: 0, count: 0 });
  });
});
