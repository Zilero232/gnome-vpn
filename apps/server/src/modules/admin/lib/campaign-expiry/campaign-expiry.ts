import { isNullish } from 'remeda';

import { CAMPAIGN_EXPIRY } from '../../config';

export const campaignExpiry = (lastDay: string | null): Date | null => (isNullish(lastDay) ? null : new Date(`${lastDay}${CAMPAIGN_EXPIRY.dayEnd}`));
