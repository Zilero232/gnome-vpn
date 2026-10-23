import type { AdminCampaign } from '@gnomevpn/schemas';

import { describe, expect, it } from 'vitest';

import { campaignBars } from '../campaign-bars';

const campaign = (patch: Partial<AdminCampaign>): AdminCampaign => ({
  id: patch.code ?? 'id',
  code: 'CODE',
  kind: 'discount',
  percent: 10,
  days: null,
  maxUses: null,
  expiresAt: null,
  createdAt: '2026-10-01T00:00:00.000Z',
  state: 'active',
  used: 0,
  payments: 0,
  revenue: 0,
  ...patch
});

const campaigns = [
  campaign({ code: 'ALPHA', used: 3, revenue: 500 }),
  campaign({ code: 'BETA', used: 9, revenue: 0, kind: 'days', percent: null, days: 7 }),
  campaign({ code: 'GAMMA', used: 0, revenue: 0 }),
  campaign({ code: 'DELTA', used: 3, revenue: 1500 })
];

describe('campaignBars', () => {
  it('ranks the codes by the chosen measure, largest first', () => {
    const bars = campaignBars({ campaigns, metric: 'used', limit: campaigns.length });
    const values = bars.map((bar) => bar.value);

    expect(values).toEqual([...values].sort((a, b) => b - a));
  });

  it('leaves out a code that has nothing to show for that measure', () => {
    const labels = campaignBars({ campaigns, metric: 'revenue', limit: campaigns.length }).map((bar) => bar.label);

    expect(labels).not.toContain('GAMMA');
    expect(labels).not.toContain('BETA');
  });

  it('breaks a tie by the code, so the order never flickers between renders', () => {
    const tied = campaignBars({ campaigns, metric: 'used', limit: campaigns.length }).filter((bar) => bar.value === 3);

    expect(tied.map((bar) => bar.label)).toEqual(['ALPHA', 'DELTA']);
  });

  it('keeps no more bars than the limit', () => {
    expect(campaignBars({ campaigns, metric: 'used', limit: 1 })).toHaveLength(1);
  });
});
