import { isReferralCode, normaliseReferralCode } from '@gnomevpn/schemas';
import { getCookie, removeCookie } from '@siberiacancode/reactuse';

import { apiErrorCode } from '@/shared/api';
import { REFERRAL_COOKIE } from '@/shared/constants';
import { isServer } from '@/shared/lib';

import { FINAL_REFUSALS } from './pending-referral.constants';

export const readPendingReferral = (): string | null => {
  if (isServer()) {
    return null;
  }

  const raw = getCookie(REFERRAL_COOKIE.name);

  return raw && isReferralCode(raw) ? normaliseReferralCode(raw) : null;
};

export const clearPendingReferral = (): void => {
  if (isServer()) {
    return;
  }

  removeCookie(REFERRAL_COOKIE.name, { path: REFERRAL_COOKIE.path });
};

export const isFinalRefusal = (error: unknown): boolean => FINAL_REFUSALS.includes(apiErrorCode(error));
