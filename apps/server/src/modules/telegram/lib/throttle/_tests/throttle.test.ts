import { describe, expect, it } from 'vitest';

import { createThrottle } from '../throttle';

const WINDOW_MS = 1_000;

describe('createThrottle', () => {
  it('lets the first call for a key through', () => {
    const allow = createThrottle(WINDOW_MS);

    expect(allow({ key: 'a', now: 0 })).toBe(true);
  });

  it('refuses a second call for the same key inside the window', () => {
    const allow = createThrottle(WINDOW_MS);

    allow({ key: 'a', now: 0 });

    expect(allow({ key: 'a', now: WINDOW_MS - 1 })).toBe(false);
  });

  it('lets the key through again once the window has passed', () => {
    const allow = createThrottle(WINDOW_MS);

    allow({ key: 'a', now: 0 });

    expect(allow({ key: 'a', now: WINDOW_MS })).toBe(true);
  });

  it('keeps keys apart, so one reader never blocks another', () => {
    const allow = createThrottle(WINDOW_MS);

    allow({ key: 'a', now: 0 });

    expect(allow({ key: 'b', now: 1 })).toBe(true);
  });

  it('does not extend the window on a refused call', () => {
    const allow = createThrottle(WINDOW_MS);

    allow({ key: 'a', now: 0 });
    allow({ key: 'a', now: WINDOW_MS - 1 });

    expect(allow({ key: 'a', now: WINDOW_MS })).toBe(true);
  });
});
