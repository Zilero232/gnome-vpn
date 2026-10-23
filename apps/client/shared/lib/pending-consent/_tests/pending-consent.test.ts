import { afterEach, describe, expect, it } from 'vitest';

import { STORAGE_KEYS } from '@/shared/constants';

import { clearPendingConsent, readPendingConsent, storePendingConsent } from '../pending-consent';

const CONSENT = { userId: 'user-1', version: '2026-10-24' };

describe('pending consent', () => {
  afterEach(() => clearPendingConsent());

  it('reads back the consent it stored', () => {
    storePendingConsent(CONSENT);

    expect(readPendingConsent()).toEqual(CONSENT);
  });

  it('forgets the consent once cleared', () => {
    storePendingConsent(CONSENT);
    clearPendingConsent();

    expect(readPendingConsent()).toBeNull();
  });

  it('ignores a stored value that is not a pending consent', () => {
    window.localStorage.setItem(STORAGE_KEYS.pendingConsent, 'not json');

    expect(readPendingConsent()).toBeNull();

    window.localStorage.setItem(STORAGE_KEYS.pendingConsent, JSON.stringify({ userId: 'user-1' }));

    expect(readPendingConsent()).toBeNull();
  });
});
