import { subMinutes, subSeconds } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { isRelayLive, isRelayPassing } from '../node-status';
import { NODE_LOSS, RELAY_DOWN } from '../node-status.constants';

const NOW = new Date('2026-11-11T12:00:00Z');

describe('isRelayPassing', () => {
  it('passes below the relay-down threshold and fails from it on', () => {
    expect(isRelayPassing(NODE_LOSS.relayDownPercent - 1)).toBe(true);
    expect(isRelayPassing(NODE_LOSS.relayDownPercent)).toBe(false);
  });

  it('never passes a node without a relay measurement', () => {
    expect(isRelayPassing(null)).toBe(false);
  });
});

describe('isRelayLive', () => {
  it('trusts a relay that was never probed', () => {
    expect(isRelayLive({ relayHealthyAt: null, now: NOW })).toBe(true);
  });

  it('keeps a relay live through the grace period after its last good probe', () => {
    expect(isRelayLive({ relayHealthyAt: subMinutes(NOW, RELAY_DOWN.staleMinutes), now: NOW })).toBe(true);
  });

  it('drops a relay once the grace period has passed', () => {
    expect(isRelayLive({ relayHealthyAt: subSeconds(subMinutes(NOW, RELAY_DOWN.staleMinutes), 1), now: NOW })).toBe(false);
  });
});
