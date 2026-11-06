import type { AdminNodePeak } from '@gnomevpn/schemas';

import { firstBy, isNonNullish } from 'remeda';

import type { PeakSummary } from './peak-summary.types';

export const peakSummary = (peaks: AdminNodePeak[]): PeakSummary => {
  const recorded = peaks.filter((peak) => isNonNullish(peak.clients));

  return {
    today: peaks.at(-1) ?? null,
    best: firstBy(recorded, [(peak) => peak.clients ?? 0, 'desc']) ?? null
  };
};
