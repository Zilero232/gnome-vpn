import { isShortCode, normaliseShortCode } from '@gnomevpn/schemas';
import { getCookie, removeCookie, setCookie } from '@siberiacancode/reactuse';

import { REFERRAL_COOKIE } from '@/shared/constants';

import { isServer } from '../env';

export const readPendingReferral = (): string | null => {
  if (isServer()) {
    return null;
  }

  const raw = getCookie(REFERRAL_COOKIE.name);

  return raw && isShortCode(raw) ? normaliseShortCode(raw) : null;
};

export const storePendingReferral = (code: string): void => {
  if (isServer()) {
    return;
  }

  setCookie(REFERRAL_COOKIE.name, normaliseShortCode(code), { maxAge: REFERRAL_COOKIE.maxAgeSeconds, path: REFERRAL_COOKIE.path, sameSite: 'Lax' });
};

export const clearPendingReferral = (): void => {
  if (isServer()) {
    return;
  }

  removeCookie(REFERRAL_COOKIE.name, { path: REFERRAL_COOKIE.path });
};

export const syncPendingReferral = (value: string): void => {
  if (isShortCode(value)) {
    storePendingReferral(value);

    return;
  }

  clearPendingReferral();
};
