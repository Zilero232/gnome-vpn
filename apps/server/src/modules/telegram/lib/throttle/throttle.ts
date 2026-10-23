import { isEmpty } from 'remeda';

import type { RateLimitInput, Throttle } from './throttle.types';

export const createThrottle = (windowMs: number): Throttle => {
  const seen = new Map<string, number>();

  return ({ key, now = Date.now() }) => {
    for (const [each, at] of seen) {
      if (now - at >= windowMs) {
        seen.delete(each);
      }
    }

    if (seen.has(key)) {
      return false;
    }

    seen.set(key, now);

    return true;
  };
};

export const createRateLimit = ({ limit, windowMs }: RateLimitInput): Throttle => {
  const seen = new Map<string, number[]>();

  return ({ key, now = Date.now() }) => {
    for (const [each, stamps] of seen) {
      const fresh = stamps.filter((at) => now - at < windowMs);

      if (isEmpty(fresh)) {
        seen.delete(each);

        continue;
      }

      seen.set(each, fresh);
    }

    const stamps = seen.get(key) ?? [];

    if (stamps.length >= limit) {
      return false;
    }

    seen.set(key, [...stamps, now]);

    return true;
  };
};
