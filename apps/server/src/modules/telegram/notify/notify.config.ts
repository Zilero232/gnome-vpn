import type { NoticeSpec } from '../telegram.types';

import { MESSAGE_EFFECT } from '../config';

export const NOTICES = {
  paid: { markup: 'main', effect: MESSAGE_EFFECT.celebrate, refreshHint: true },
  expired: { markup: 'main' },
  renewed: { markup: ['autoRenew'], effect: MESSAGE_EFFECT.thumbsUp, refreshHint: true },
  renewSoon: { markup: ['autoRenew'] },
  chargeFailed: { markup: ['renew'] },
  endingSoon: { markup: ['renew'] },
  trialEndingSoon: { markup: ['renew'] },
  devicesAdded: { markup: ['devices'], effect: MESSAGE_EFFECT.thumbsUp },
  deviceAdded: { markup: ['devices'] },
  wireguardAdded: { markup: ['devices'] },
  deviceBlocked: { markup: ['devices'] },
  devicesShrunk: { markup: ['devices'] },
  legacyRetired: { markup: ['devices'] },
  referralBonus: { markup: ['invite'] },
  referralRewarded: { markup: ['invite'], effect: MESSAGE_EFFECT.celebrate },
  referralBanked: { markup: ['buy'] },
  giftPurchased: { markup: ['website'], effect: MESSAGE_EFFECT.celebrate },
  winBackOffer: { markup: ['renew'], isPromotional: true },
  trialWinBackOffer: { markup: ['buy'], isPromotional: true },
  winBackReminder: { markup: ['buy'], isPromotional: true },
  checkoutAbandoned: { markup: ['buy'] },
  giftCheckoutAbandoned: { markup: ['website'] }
} as const satisfies Record<string, NoticeSpec>;

export const NOTICE_EMAIL = {
  path: '/account',
  tab: 'subscription'
} as const;
