import type { AdminShare } from '@gnomevpn/schemas';

import { groupBy, sortBy, sumBy } from 'remeda';

import type { FoldSharesInput, ShareRow } from './share-fold.types';

const labelOf = (label: string | null): string | null => {
  const trimmed = label?.trim() ?? '';

  return trimmed === '' ? null : trimmed;
};

const merged = (rows: ShareRow[]): ShareRow[] =>
  Object.values(groupBy(rows, (row) => labelOf(row.label) ?? '')).map((group) => ({
    label: labelOf(group[0].label),
    count: sumBy(group, (row) => row.count)
  }));

export const foldShares = ({ rows, limit }: FoldSharesInput): AdminShare[] => {
  const sorted = sortBy(
    merged(rows).filter((row) => row.count > 0),
    [(row) => row.count, 'desc'],
    [(row) => row.label ?? '', 'asc']
  );

  const top = sorted.slice(0, limit).map((row) => ({ ...row, isOther: false }));
  const rest = sumBy(sorted.slice(limit), (row) => row.count);

  return rest > 0 ? [...top, { label: null, isOther: true, count: rest }] : top;
};
