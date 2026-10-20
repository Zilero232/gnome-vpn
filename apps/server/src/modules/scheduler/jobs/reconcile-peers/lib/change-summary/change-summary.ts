import { entries } from 'remeda';

import type { ChangeSummaryInput } from './change-summary.types';

export const changeSummary = (changes: ChangeSummaryInput): string[] =>
  entries(changes)
    .filter(([, count]) => count > 0)
    .map(([name, count]) => `${name} ${count}`);
