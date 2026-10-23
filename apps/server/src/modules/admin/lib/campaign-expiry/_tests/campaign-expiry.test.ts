import { addSeconds } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { campaignExpiry } from '../campaign-expiry';

const MOSCOW_OFFSET_HOURS = 3;

describe('campaignExpiry', () => {
  it('keeps the code working through the whole last day in Moscow', () => {
    const expiry = campaignExpiry('2026-12-31');
    const nextMoscowMidnight = new Date(Date.UTC(2027, 0, 1, -MOSCOW_OFFSET_HOURS));

    expect(expiry && addSeconds(expiry, 1).getTime()).toBe(nextMoscowMidnight.getTime());
  });

  it('has no expiry when no day is given', () => {
    expect(campaignExpiry(null)).toBeNull();
  });
});
