import { isNonNullish } from 'remeda';

import type { WindowCache, WindowEntry } from './window-cache.types';

export const createWindowCache = <T>(windowMs: number): WindowCache<T> => {
  const entries = new Map<string, WindowEntry<T>>();

  return {
    take: ({ key, now = Date.now(), create }) => {
      for (const [each, entry] of entries) {
        if (now - entry.at >= windowMs) {
          entries.delete(each);
        }
      }

      const cached = entries.get(key);

      if (isNonNullish(cached)) {
        return cached.value;
      }

      const value = create();

      entries.set(key, { at: now, value });

      return value;
    },
    forget: (key) => {
      entries.delete(key);
    }
  };
};
