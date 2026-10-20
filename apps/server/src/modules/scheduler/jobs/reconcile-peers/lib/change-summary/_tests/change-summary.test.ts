import { describe, expect, it } from 'vitest';

import { changeSummary } from '../change-summary';

const NOTHING = { released: 0, retired: 0, restored: 0, synced: 0, collected: 0 };

describe('changeSummary', () => {
  it('names nothing when the pass changed nothing', () => {
    expect(changeSummary(NOTHING)).toEqual([]);
  });

  it('names every change with the number of clients it touched', () => {
    expect(changeSummary({ ...NOTHING, released: 1, synced: 3 })).toEqual(['released 1', 'synced 3']);
  });
});
