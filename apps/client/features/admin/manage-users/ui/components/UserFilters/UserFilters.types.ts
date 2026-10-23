import type { inferParserType, Nullable } from 'nuqs';

import type { USER_FILTERS } from '../../../config';

type UserFilterValues = inferParserType<typeof USER_FILTERS.parsers>;

export type UserFiltersProps = {
  value: UserFilterValues;
  onChange: (next: Partial<Nullable<UserFilterValues>>) => void;
};
