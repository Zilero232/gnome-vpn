import type { AdminCampaignState } from '@gnomevpn/schemas';

import { isAfter } from 'date-fns';
import { isNonNullish } from 'remeda';

import type { CampaignStateInput } from './campaign-state.types';

export const campaignState = ({ expiresAt, maxUses, used, now }: CampaignStateInput): AdminCampaignState => {
  if (isNonNullish(expiresAt) && !isAfter(expiresAt, now)) {
    return 'expired';
  }

  return isNonNullish(maxUses) && used >= maxUses ? 'usedUp' : 'active';
};
