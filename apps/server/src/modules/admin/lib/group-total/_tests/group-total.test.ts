import { describe, expect, it } from 'vitest';

import { Prisma } from '@/generated';

import { groupTotal } from '../group-total';

const GROUPS = [
  { plan: 'month', _count: { _all: 3 }, _sum: { amount: new Prisma.Decimal('2970.00') } },
  { plan: 'year', _count: { _all: 1 }, _sum: { amount: null } }
];

describe('groupTotal', () => {
  it('reads the count and the summed amount of the matching group', () => {
    expect(groupTotal({ groups: GROUPS, by: 'plan', value: 'month' })).toEqual({ count: 3, amount: 2970 });
  });

  it('reads a group whose amounts were all null as no money', () => {
    expect(groupTotal({ groups: GROUPS, by: 'plan', value: 'year' })).toEqual({ count: 1, amount: 0 });
  });

  it('reads a value the query returned no group for as nothing', () => {
    expect(groupTotal({ groups: GROUPS, by: 'plan', value: 'quarter' })).toEqual({ count: 0, amount: 0 });
  });

  it('counts groups that carry no sum at all', () => {
    expect(groupTotal({ groups: [{ referrerId: 'a', _count: { _all: 2 } }], by: 'referrerId', value: 'a' }).count).toBe(2);
  });
});
