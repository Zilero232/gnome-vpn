import type { Throttle } from './throttle.types';

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
