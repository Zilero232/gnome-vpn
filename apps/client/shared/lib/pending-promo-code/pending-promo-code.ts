import { isPromoCode, normalisePromoCode } from '@gnomevpn/schemas';
import { getCookie, removeCookie, setCookie } from '@siberiacancode/reactuse';

import { REFERRAL_COOKIE } from '@/shared/constants';

import { isServer } from '../env';

export const readPendingPromoCode = (): string | null => {
  if (isServer()) {
    return null;
  }

  const raw = getCookie(REFERRAL_COOKIE.name);

  return raw && isPromoCode(raw) ? normalisePromoCode(raw) : null;
};

export const storePendingPromoCode = (code: string): void => {
  if (isServer()) {
    return;
  }

  setCookie(REFERRAL_COOKIE.name, normalisePromoCode(code), { maxAge: REFERRAL_COOKIE.maxAgeSeconds, path: REFERRAL_COOKIE.path, sameSite: 'Lax' });
};

export const clearPendingPromoCode = (): void => {
  if (isServer()) {
    return;
  }

  removeCookie(REFERRAL_COOKIE.name, { path: REFERRAL_COOKIE.path });
};

export const syncPendingPromoCode = (value: string): void => {
  if (isPromoCode(value)) {
    storePendingPromoCode(value);

    return;
  }

  clearPendingPromoCode();
};
