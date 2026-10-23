import { isPromoCode, normalisePromoCode, promoCodeOrigin, REFERRAL_CODE } from '@gnomevpn/schemas';

import { REFERRAL_COOKIE } from '@/shared/constants';

import type { RememberReferralInput } from './referral-cookie.types';

const codeFrom = (raw: string | null): string | null => (raw && isPromoCode(raw) ? normalisePromoCode(raw) : null);

export const referralFromUrl = (url: URL): string | null => {
  const promo = codeFrom(url.searchParams.get(REFERRAL_CODE.promoParam));
  const ref = codeFrom(url.searchParams.get(REFERRAL_CODE.param));

  return promo ?? (ref && promoCodeOrigin(ref) !== 'campaign' ? ref : null);
};

export const rememberReferral = ({ request, response }: RememberReferralInput): void => {
  const code = referralFromUrl(request.nextUrl);

  if (!code || request.cookies.has(REFERRAL_COOKIE.name)) {
    return;
  }

  response.cookies.set(REFERRAL_COOKIE.name, code, {
    maxAge: REFERRAL_COOKIE.maxAgeSeconds,
    path: REFERRAL_COOKIE.path,
    sameSite: 'lax'
  });
};
