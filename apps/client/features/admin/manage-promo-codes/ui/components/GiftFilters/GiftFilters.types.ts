import type { inferParserType, Nullable } from 'nuqs';

import type { GIFT_FILTERS } from '../../../config';

type GiftFilterValues = inferParserType<typeof GIFT_FILTERS.parsers>;

export type GiftFiltersProps = {
  value: GiftFilterValues;
  onChange: (next: Partial<Nullable<GiftFilterValues>>) => void;
};
