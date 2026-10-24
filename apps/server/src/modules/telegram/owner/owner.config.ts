import { PROMO_CODE, PROMO_DAYS, PROMO_DISCOUNT } from '@gnomevpn/schemas';

import type { CampaignProblem } from '@/modules/promo-codes';

import type { BroadcastAudience } from '../shared/callback-data';
import type { BotText } from '../telegram.types';
import type { CampaignProblemText } from './owner.types';

export const BROADCAST = {
  perSecond: 25,
  floodRetries: 3,
  audienceLabel: {
    all: 'broadcastAll',
    active: 'broadcastActive',
    inactive: 'broadcastInactive'
  } satisfies Record<BroadcastAudience, keyof BotText>,
  copyableFields: [
    'text',
    'caption',
    'photo',
    'video',
    'animation',
    'document',
    'audio',
    'voice',
    'video_note',
    'sticker',
    'poll',
    'location',
    'contact',
    'venue',
    'dice'
  ]
} as const;

export const PROMO_COMMAND = {
  stop: 'off',
  percent: /^(\d+)%$/u,
  days: /^\+?(\d+)d$/iu,
  uses: /^uses=(\d+)$/iu,
  until: /^until=(\d{4}-\d{2}-\d{2})$/iu,
  dateFormat: 'yyyy-MM-dd',
  dayEnd: 'T23:59:59+03:00',
  separator: /\s+/u
} as const;

export const CAMPAIGN_TEXT = {
  problems: {
    codeFormat: { key: 'promoProblemCodeFormat', min: PROMO_CODE.minLength, max: PROMO_CODE.maxLength },
    codeLikeFriend: { key: 'promoProblemCodeLikeFriend' },
    codeLikeGift: { key: 'promoProblemCodeLikeGift' },
    percentRange: { key: 'promoProblemPercentRange', min: PROMO_DISCOUNT.minPercent, max: PROMO_DISCOUNT.maxPercent },
    daysRange: { key: 'promoProblemDaysRange', min: PROMO_DAYS.min, max: PROMO_DAYS.max },
    maxUsesRange: { key: 'promoProblemMaxUsesRange', min: 1, max: PROMO_CODE.maxUses },
    expiryInvalid: { key: 'promoProblemExpiryInvalid' },
    expiryPast: { key: 'promoProblemExpiryPast' }
  } satisfies Record<CampaignProblem, CampaignProblemText>,
  lineSeparator: ' · ',
  detailSeparator: ', '
} as const;
