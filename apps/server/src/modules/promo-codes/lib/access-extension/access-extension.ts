import { addDays, max } from 'date-fns';

import { hasLapsedBeyondGrace } from '@/common/lib';

import type { AccessExtension, AccessExtensionInput } from './access-extension.types';

export const accessExtension = ({ currentPeriodEnd, days, now }: AccessExtensionInput): AccessExtension => ({
  currentPeriodEnd: addDays(max([now, currentPeriodEnd ?? now]), days),
  resetsExtras: hasLapsedBeyondGrace({ currentPeriodEnd, at: now })
});
