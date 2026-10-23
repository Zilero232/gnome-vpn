import { sumBy } from 'remeda';
import { describe, expect, it } from 'vitest';

import type { ShareRow } from '../share-fold.types';

import { foldShares } from '../share-fold';

const ROWS: ShareRow[] = [
  { label: 'android', count: 40 },
  { label: 'ios', count: 30 },
  { label: 'windows', count: 12 },
  { label: null, count: 9 },
  { label: 'macos', count: 5 },
  { label: 'linux', count: 2 }
];

describe('foldShares', () => {
  it('keeps the largest groups first and folds the tail into one other entry', () => {
    const limit = 3;
    const shares = foldShares({ rows: ROWS, limit });

    expect(shares).toHaveLength(limit + 1);
    expect(shares.slice(0, limit).map((share) => share.count)).toEqual([40, 30, 12]);
    expect(shares.at(-1)).toMatchObject({ isOther: true, label: null });
  });

  it('never loses a device in the fold', () => {
    const shares = foldShares({ rows: ROWS, limit: 2 });

    expect(sumBy(shares, (share) => share.count)).toBe(sumBy(ROWS, (row) => row.count));
  });

  it('adds no other entry when everything fits', () => {
    expect(foldShares({ rows: ROWS, limit: ROWS.length }).some((share) => share.isOther)).toBe(false);
  });

  it('keeps an unknown label as its own entry rather than calling it other', () => {
    const unknown = foldShares({ rows: ROWS, limit: ROWS.length }).find((share) => share.label === null);

    expect(unknown).toMatchObject({ isOther: false, count: 9 });
  });

  it('counts an empty label as unknown and merges it with the missing ones', () => {
    const shares = foldShares({
      rows: [
        { label: ' ', count: 1 },
        { label: null, count: 2 }
      ],
      limit: 5
    });

    expect(shares).toEqual([{ label: null, isOther: false, count: 3 }]);
  });
});
