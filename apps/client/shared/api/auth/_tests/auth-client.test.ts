import { STORAGE_EVENT } from '@siberiacancode/reactuse';
import { beforeEach, describe, expect, it } from 'vitest';

import { STORAGE_KEYS } from '@/shared/constants';

import { clearToken, saveAuthToken } from '../auth-client';

describe('saveAuthToken', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('reports a change when the reader is a different one, which is what clears their cache', () => {
    expect(saveAuthToken('first')).toBe(true);
    expect(saveAuthToken('second')).toBe(true);
  });

  it('reports no change when the same token is sent back, so a refresh does not wipe the cache', () => {
    saveAuthToken('same');

    expect(saveAuthToken('same')).toBe(false);
  });

  it('stores what it was given', () => {
    saveAuthToken('written');

    expect(window.localStorage.getItem(STORAGE_KEYS.authToken)).toBe('written');
  });

  it('ignores an absent token rather than clearing the one already held', () => {
    saveAuthToken('kept');

    expect(saveAuthToken(null)).toBe(false);
    expect(window.localStorage.getItem(STORAGE_KEYS.authToken)).toBe('kept');
  });

  it('announces a new token and a cleared one, so a session check already on screen sees it without a reload', () => {
    const values: (string | null)[] = [];

    const listener = (event: Event) => {
      if (event instanceof StorageEvent) {
        values.push(event.newValue);
      }
    };

    window.addEventListener(STORAGE_EVENT, listener);
    saveAuthToken('announced');
    saveAuthToken('announced');
    clearToken();
    window.removeEventListener(STORAGE_EVENT, listener);

    expect(values).toEqual(['announced', null]);
  });
});
