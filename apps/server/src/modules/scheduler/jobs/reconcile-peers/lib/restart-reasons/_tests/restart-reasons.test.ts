import { describe, expect, it } from 'vitest';

import { restartReasons } from '../restart-reasons';

const NOTHING = { released: false, retired: 0, restored: false, synced: false, collected: false };

describe('restartReasons', () => {
  it('names nothing when the pass changed nothing, so the core is left running', () => {
    expect(restartReasons(NOTHING)).toEqual([]);
  });

  it('names every change that needs the core restarted', () => {
    expect(restartReasons({ ...NOTHING, released: true, synced: true })).toEqual(['released', 'synced']);
  });

  it('counts retired peers as a change only when there were some', () => {
    expect(restartReasons({ ...NOTHING, retired: 2 })).toEqual(['retired']);
  });
});
