import type { AdminCampaign } from '@gnomevpn/schemas';

export type CampaignChartProps = {
  campaigns: AdminCampaign[];
  isFaded: boolean;
};
