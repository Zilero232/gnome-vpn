import { isReferralCode, normaliseReferralCode, REFERRAL_CODE } from '@gnomevpn/schemas';

import type { TelegramReferralLinkInput, WebReferralLinkInput } from './referral-link.types';

import { REFERRAL_LINK } from '../../config';

export const webReferralLink = ({ clientUrl, code }: WebReferralLinkInput): string => {
  const url = new URL('/', clientUrl);

  url.searchParams.set(REFERRAL_CODE.param, code);

  return url.toString();
};

export const telegramStartPayload = (code: string): string => `${REFERRAL_LINK.telegramPrefix}${code}`;

export const telegramReferralLink = ({ botUsername, code }: TelegramReferralLinkInput): string | null => {
  const handle = botUsername.startsWith(REFERRAL_LINK.atSign) ? botUsername.slice(REFERRAL_LINK.atSign.length) : botUsername;

  if (!handle) {
    return null;
  }

  return `${REFERRAL_LINK.telegramBase}/${encodeURIComponent(handle)}?start=${telegramStartPayload(code)}`;
};

export const referralCodeFromStart = (payload: string): string | null => {
  if (!payload.startsWith(REFERRAL_LINK.telegramPrefix)) {
    return null;
  }

  const code = payload.slice(REFERRAL_LINK.telegramPrefix.length);

  return isReferralCode(code) ? normaliseReferralCode(code) : null;
};
