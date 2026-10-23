import { describe, expect, it } from 'vitest';

import { shareItems } from '../share-items';

const labels = { unknown: 'unknown', other: 'other' };

describe('shareItems', () => {
  it('keeps a named value as it was reported', () => {
    expect(shareItems({ shares: [{ label: 'android', isOther: false, count: 5 }], labels })[0]).toMatchObject({ label: 'android', value: 5 });
  });

  it('names a reported value through the given formatter', () => {
    const shares = [{ label: 'macos', isOther: false, count: 3 }];

    expect(shareItems({ shares, labels, nameOf: (label) => label.toUpperCase() })[0].label).toBe('MACOS');
  });

  it('names the folded tail and the rows nobody reported', () => {
    const items = shareItems({
      shares: [
        { label: null, isOther: false, count: 2 },
        { label: null, isOther: true, count: 7 }
      ],
      labels
    });

    expect(items.map((item) => item.label)).toEqual([labels.unknown, labels.other]);
  });

  it('gives every row its own key even when two labels match', () => {
    const items = shareItems({
      shares: [
        { label: 'ios', isOther: false, count: 1 },
        { label: 'ios', isOther: false, count: 1 }
      ],
      labels
    });

    expect(new Set(items.map((item) => item.key)).size).toBe(items.length);
  });
});
