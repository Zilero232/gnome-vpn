import { sortBy } from 'remeda';

import type { CampaignBar, CampaignBarsInput } from './campaign-bars.types';

export const campaignBars = ({ campaigns, metric, limit }: CampaignBarsInput): CampaignBar[] =>
  sortBy(
    campaigns.filter((campaign) => campaign[metric] > 0),
    [(campaign) => campaign[metric], 'desc'],
    [(campaign) => campaign.code, 'asc']
  )
    .slice(0, limit)
    .map((campaign) => ({ key: campaign.id, label: campaign.code, value: campaign[metric] }));
