import { values } from 'remeda';

import { NOTICE_CLAIM } from '@/core';

export const WIN_BACK = {
  percent: 20,
  codes: {
    lapsed: 'WELCOMEBACK',
    trial: 'AFTERTRIAL'
  },
  touchDays: {
    lapsed: { first: 3, second: 14 },
    trial: { first: 1, second: 7 }
  },
  lateDays: 7,
  offerNotice: {
    lapsed: 'winBackOffer',
    trial: 'trialWinBackOffer'
  },
  reminderNotice: 'winBackReminder',
  claims: values(NOTICE_CLAIM.winBackTouch)
} as const;
