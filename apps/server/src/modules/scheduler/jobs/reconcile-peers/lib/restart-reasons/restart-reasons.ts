import { entries } from 'remeda';

import type { RestartReasonsInput } from './restart-reasons.types';

export const restartReasons = (changes: RestartReasonsInput): string[] =>
  entries(changes)
    .filter(([, changed]) => Boolean(changed))
    .map(([name]) => name);
