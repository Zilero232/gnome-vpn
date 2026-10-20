import { isNullish } from 'remeda';

import type { BlockedNoticeClaimInput } from './blocked-notice.types';

import { BLOCKED_NOTICE } from './blocked-notice.constants';

export const claimBlockedNotice = ({ stored, noticeAt, key, windowStart }: BlockedNoticeClaimInput): string | null => {
  if (isNullish(stored) || isNullish(noticeAt) || noticeAt < windowStart) {
    return key;
  }

  const told = stored.split(BLOCKED_NOTICE.separator);

  if (told.includes(key) || told.length >= BLOCKED_NOTICE.maxKeys) {
    return null;
  }

  return [...told, key].join(BLOCKED_NOTICE.separator);
};
