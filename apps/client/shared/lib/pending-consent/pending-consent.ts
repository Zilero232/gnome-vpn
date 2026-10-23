import { STORAGE_KEYS } from '@/shared/constants';

import type { PendingConsent } from './pending-consent.types';

import { isServer } from '../env';
import { pendingConsentSchema } from './pending-consent.schemas';

export const readPendingConsent = (): PendingConsent | null => {
  if (isServer()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.pendingConsent);
    const parsed = pendingConsentSchema.safeParse(raw ? JSON.parse(raw) : null);

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export const storePendingConsent = (consent: PendingConsent): void => {
  if (isServer()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEYS.pendingConsent, JSON.stringify(consent));
  } catch {}
};

export const clearPendingConsent = (): void => {
  if (isServer()) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEYS.pendingConsent);
  } catch {}
};
