import type { AdminCampaign } from '@gnomevpn/schemas';

export type UseCampaignColumnsInput = {
  onStop: (campaign: AdminCampaign) => void;
};
