import type { UseQueryStatesKeysMap } from 'nuqs';

export type UseListFiltersInput<Parsers extends UseQueryStatesKeysMap> = {
  scope: string;
  parsers: Parsers;
};
