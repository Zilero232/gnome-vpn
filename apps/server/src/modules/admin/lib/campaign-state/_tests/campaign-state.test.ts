import { addDays, subMinutes } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { campaignState } from '../campaign-state';

const NOW = new Date('2026-10-23T12:00:00.000Z');

describe('campaignState', () => {
  it('is active with no expiry and no limit', () => {
    expect(campaignState({ expiresAt: null, maxUses: null, used: 1000, now: NOW })).toBe('active');
  });

  it('is expired from the moment of its expiry, which is how a stopped code reads', () => {
    expect(campaignState({ expiresAt: NOW, maxUses: null, used: 0, now: NOW })).toBe('expired');
    expect(campaignState({ expiresAt: subMinutes(NOW, 1), maxUses: null, used: 0, now: NOW })).toBe('expired');
  });

  it('is used up once the redemptions reach the limit', () => {
    const maxUses = 10;

    expect(campaignState({ expiresAt: null, maxUses, used: maxUses - 1, now: NOW })).toBe('active');
    expect(campaignState({ expiresAt: null, maxUses, used: maxUses, now: NOW })).toBe('usedUp');
  });

  it('reports the expiry first when a code is both expired and used up', () => {
    expect(campaignState({ expiresAt: subMinutes(NOW, 1), maxUses: 1, used: 1, now: NOW })).toBe('expired');
  });

  it('stays active before a future expiry', () => {
    expect(campaignState({ expiresAt: addDays(NOW, 1), maxUses: null, used: 0, now: NOW })).toBe('active');
  });
});
