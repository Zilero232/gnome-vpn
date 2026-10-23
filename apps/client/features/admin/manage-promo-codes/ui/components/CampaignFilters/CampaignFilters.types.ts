import type { inferParserType, Nullable } from 'nuqs';

import type { CAMPAIGN_FILTERS } from '../../../config';

type CampaignFilterValues = inferParserType<typeof CAMPAIGN_FILTERS.parsers>;

export type CampaignFiltersProps = {
  value: CampaignFilterValues;
  onChange: (next: Partial<Nullable<CampaignFilterValues>>) => void;
};
