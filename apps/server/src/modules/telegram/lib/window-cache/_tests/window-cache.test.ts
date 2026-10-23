import { describe, expect, it, vi } from 'vitest';

import { createWindowCache } from '../window-cache';

const WINDOW_MS = 1_000;

describe('createWindowCache', () => {
  it('creates once and hands the same value to every caller inside the window', () => {
    const cache = createWindowCache<number>(WINDOW_MS);
    const create = vi.fn(() => 1);

    cache.take({ key: 'a', now: 0, create });
    cache.take({ key: 'a', now: WINDOW_MS - 1, create });

    expect(create).toHaveBeenCalledTimes(1);
  });

  it('creates again once the window counted from creation has passed', () => {
    const cache = createWindowCache<number>(WINDOW_MS);
    const create = vi.fn(() => 1);

    cache.take({ key: 'a', now: 0, create });
    cache.take({ key: 'a', now: WINDOW_MS / 2, create });
    cache.take({ key: 'a', now: WINDOW_MS, create });

    expect(create).toHaveBeenCalledTimes(2);
  });

  it('creates again after the key is forgotten, so a failed value is not reused', () => {
    const cache = createWindowCache<number>(WINDOW_MS);
    const create = vi.fn(() => 1);

    cache.take({ key: 'a', now: 0, create });
    cache.forget('a');
    cache.take({ key: 'a', now: 1, create });

    expect(create).toHaveBeenCalledTimes(2);
  });

  it('keeps keys apart', () => {
    const cache = createWindowCache<string>(WINDOW_MS);

    cache.take({ key: 'a', now: 0, create: () => 'first' });

    expect(cache.take({ key: 'b', now: 0, create: () => 'second' })).toBe('second');
  });
});
