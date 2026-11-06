import type { AdminNodePeak } from '@gnomevpn/schemas';

import { describe, expect, it } from 'vitest';

import { peakSummary } from '../peak-summary';

const day = (date: string, clients: number | null): AdminNodePeak => ({
  date,
  clients,
  clientsAt: clients === null ? null : `${date}T19:14:00.000Z`,
  users: clients,
  cpu: null,
  memory: null
});

describe('peakSummary', () => {
  it('takes today from the last day of the window', () => {
    const peaks = [day('2026-11-05', 30), day('2026-11-06', 12)];

    expect(peakSummary(peaks).today).toBe(peaks.at(-1));
  });

  it('picks the busiest recorded day as the best, skipping days without a record', () => {
    const peaks = [day('2026-11-04', null), day('2026-11-05', 37), day('2026-11-06', 12)];

    expect(peakSummary(peaks).best).toBe(peaks[1]);
  });

  it('keeps the earlier day when two days tie', () => {
    const peaks = [day('2026-11-05', 20), day('2026-11-06', 20)];

    expect(peakSummary(peaks).best).toBe(peaks[0]);
  });

  it('has nothing to show before the first record', () => {
    expect(peakSummary([day('2026-11-06', null)]).best).toBeNull();
    expect(peakSummary([])).toEqual({ today: null, best: null });
  });
});
