import { describe, expect, it } from 'vitest';

import { barShares } from '../BarList.helpers';

const items = [
  { key: 'a', label: 'A', value: 3 },
  { key: 'b', label: 'B', value: 1 },
  { key: 'c', label: 'C', value: 0 }
];

describe('barShares', () => {
  it('gives each bar its share of the whole, so the shares add up to one', () => {
    const shares = barShares(items).map((item) => item.share);

    expect(shares.reduce((sum, share) => sum + share, 0)).toBeCloseTo(1);
    expect(shares[0]).toBe(3 * shares[1]);
  });

  it('draws a zero as an empty bar, not a sliver', () => {
    expect(barShares(items)[2].share).toBe(0);
  });

  it('has no shares to divide when everything is zero, rather than NaN', () => {
    expect(barShares(items.map((item) => ({ ...item, value: 0 }))).every((item) => item.share === 0)).toBe(true);
  });

  it('keeps every field it was given', () => {
    expect(barShares([{ key: 'k', label: 'L', value: 2, detail: 'two' }])[0]).toMatchObject({ key: 'k', label: 'L', detail: 'two' });
  });
});
