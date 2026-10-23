import { sumBy } from 'remeda';

import type { BarListItem, BarShare } from './BarList.types';

export const barShares = (items: BarListItem[]): BarShare[] => {
  const total = sumBy(items, (item) => Math.max(item.value, 0));

  return items.map((item) => ({ ...item, share: total > 0 ? Math.max(item.value, 0) / total : 0 }));
};
