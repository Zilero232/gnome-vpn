import { PROMO_CODE, PROMO_DAYS, PROMO_DISCOUNT } from '@gnomevpn/schemas';

import type { CampaignProblem } from '../../../promo-codes';
import type { CampaignProblemText } from './promo-text.types';

export const CAMPAIGN_PROBLEM_TEXT: Record<CampaignProblem, CampaignProblemText> = {
  codeFormat: { key: 'promoProblemCodeFormat', min: PROMO_CODE.minLength, max: PROMO_CODE.maxLength },
  codeLikeFriend: { key: 'promoProblemCodeLikeFriend' },
  codeLikeGift: { key: 'promoProblemCodeLikeGift' },
  percentRange: { key: 'promoProblemPercentRange', min: PROMO_DISCOUNT.minPercent, max: PROMO_DISCOUNT.maxPercent },
  daysRange: { key: 'promoProblemDaysRange', min: PROMO_DAYS.min, max: PROMO_DAYS.max },
  maxUsesRange: { key: 'promoProblemMaxUsesRange', min: 1, max: PROMO_CODE.maxUses },
  expiryInvalid: { key: 'promoProblemExpiryInvalid' },
  expiryPast: { key: 'promoProblemExpiryPast' }
};

export const CAMPAIGN_LINE_SEPARATOR = ' · ';

export const CAMPAIGN_DETAIL_SEPARATOR = ', ';
