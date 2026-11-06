import type { AdminNodePeak } from '@gnomevpn/schemas';

export type PeakSummary = {
  today: AdminNodePeak | null;
  best: AdminNodePeak | null;
};
