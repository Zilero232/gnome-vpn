import { describe, expect, it } from 'vitest';

import { createRateLimit, createThrottle } from '../throttle';

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

describe('createRateLimit', () => {
  const LIMIT = 3;

  it('lets a burst through up to the limit, so an album of screenshots arrives whole', () => {
    const allow = createRateLimit({ limit: LIMIT, windowMs: WINDOW_MS });
    const passed = Array.from({ length: LIMIT }, (_, index) => allow({ key: 'a', now: index }));

    expect(passed.every(Boolean)).toBe(true);
  });

  it('refuses the call past the limit inside the window', () => {
    const allow = createRateLimit({ limit: LIMIT, windowMs: WINDOW_MS });

    for (let index = 0; index < LIMIT; index += 1) {
      allow({ key: 'a', now: index });
    }

    expect(allow({ key: 'a', now: LIMIT })).toBe(false);
  });

  it('frees a slot once the oldest call leaves the window', () => {
    const allow = createRateLimit({ limit: LIMIT, windowMs: WINDOW_MS });

    for (let index = 0; index < LIMIT; index += 1) {
      allow({ key: 'a', now: index });
    }

    expect(allow({ key: 'a', now: WINDOW_MS })).toBe(true);
    expect(allow({ key: 'a', now: WINDOW_MS })).toBe(false);
  });

  it('counts each key on its own', () => {
    const allow = createRateLimit({ limit: 1, windowMs: WINDOW_MS });

    allow({ key: 'a', now: 0 });

    expect(allow({ key: 'b', now: 0 })).toBe(true);
  });
});
