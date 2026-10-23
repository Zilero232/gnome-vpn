'use client';

import type { Nullable, UrlKeys, UseQueryStatesKeysMap, Values } from 'nuqs';

import { parseAsInteger, useQueryState, useQueryStates } from 'nuqs';
import { isNonNullish, keys, pickBy } from 'remeda';

import type { UseListFiltersInput } from './use-list-filters.types';

export const useListFilters = <Parsers extends UseQueryStatesKeysMap>({ scope, parsers }: UseListFiltersInput<Parsers>) => {
  const urlKeys = Object.fromEntries(keys(parsers).map((key) => [key, `${scope}.${key}`])) as UrlKeys<Parsers>;
  const [filters, setFilters] = useQueryStates(parsers, { urlKeys });
  const [page, setPage] = useQueryState(`${scope}.page`, parseAsInteger.withDefault(1));

  const isFiltered = keys(parsers).some((key) => filters[key] !== (parsers[key].defaultValue ?? null));

  const change = (next: Partial<Nullable<Values<Parsers>>>) => {
    void setFilters(next);
    void setPage(null);
  };

  const reset = () => {
    void setFilters(null);
    void setPage(null);
  };

  return { filters, query: pickBy(filters, isNonNullish), page, setPage, change, reset, isFiltered };
};
