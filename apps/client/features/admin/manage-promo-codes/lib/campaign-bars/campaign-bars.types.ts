import type { AdminCampaign } from '@gnomevpn/schemas';

export type CampaignMetric = 'revenue' | 'used';

export type CampaignBarsInput = {
  campaigns: AdminCampaign[];
  metric: CampaignMetric;
  limit: number;
};

export type CampaignBar = {
  key: string;
  label: string;
  value: number;
};
