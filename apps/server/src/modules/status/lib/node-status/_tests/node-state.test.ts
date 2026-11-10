import { NODE_STATE } from '@gnomevpn/schemas';
import { addSeconds, subMinutes, subSeconds } from 'date-fns';
import { describe, expect, it } from 'vitest';

import type { ProbeStamps } from '../node-status.types';

import { nodeState, passedCheck } from '../node-status';
import { NODE_DOWN, NODE_LOSS } from '../node-status.constants';

const NOW = new Date('2026-10-23T12:00:30Z');

const healthyMinuteAgo: ProbeStamps = {
  lastHealthyAt: subMinutes(NOW, 1),
  lastCheckedAt: subSeconds(subMinutes(NOW, 1), 2),
  isOverloaded: false,
  packetLoss: null
};

describe('nodeState', () => {
  it('reads a node whose last check passed as up', () => {
    expect(nodeState({ ...healthyMinuteAgo })).toBe(NODE_STATE.up);
  });

  it('reads a node never seen healthy as down', () => {
    expect(nodeState({ lastHealthyAt: null, lastCheckedAt: NOW, isOverloaded: false, packetLoss: null })).toBe(NODE_STATE.down);
  });

  it('turns down on the last of the failed checks in a row, and not one check before', () => {
    const lastHealthyAt = addSeconds(subMinutes(NOW, 10), 4);
    const checkAfter = (failed: number) => subMinutes(NOW, 10 - failed);

    expect(
      nodeState({ lastHealthyAt, lastCheckedAt: checkAfter(NODE_DOWN.statusPage.failedChecks - 1), isOverloaded: false, packetLoss: null })
    ).toBe(NODE_STATE.degraded);

    expect(nodeState({ lastHealthyAt, lastCheckedAt: checkAfter(NODE_DOWN.statusPage.failedChecks), isOverloaded: false, packetLoss: null })).toBe(
      NODE_STATE.down
    );
  });

  it('keeps the last known state while the checks themselves stop, since an API outage is not the node going down', () => {
    const lastCheckedAt = subMinutes(NOW, 30);

    expect(nodeState({ lastHealthyAt: addSeconds(lastCheckedAt, 3), lastCheckedAt, isOverloaded: false, packetLoss: null })).toBe(NODE_STATE.up);
  });

  it('reads a failed latest check on a node healthy a minute ago as degraded', () => {
    expect(nodeState({ ...healthyMinuteAgo, lastCheckedAt: NOW })).toBe(NODE_STATE.degraded);
  });

  it('reads a reachable node over the load thresholds as degraded', () => {
    expect(nodeState({ ...healthyMinuteAgo, isOverloaded: true, packetLoss: null })).toBe(NODE_STATE.degraded);
  });

  it('marks a reachable node degraded while it loses packets, and only from the threshold on', () => {
    expect(nodeState({ ...healthyMinuteAgo, packetLoss: NODE_LOSS.degradedPercent })).toBe(NODE_STATE.degraded);
    expect(nodeState({ ...healthyMinuteAgo, packetLoss: NODE_LOSS.degradedPercent - 1 })).toBe(NODE_STATE.up);
  });

  it('never lets the load flag lift a down node to degraded', () => {
    expect(nodeState({ lastHealthyAt: null, lastCheckedAt: null, isOverloaded: true, packetLoss: null })).toBe(NODE_STATE.down);
  });

  it('reads a node checked never but seen healthy recently by its health stamp alone', () => {
    expect(nodeState({ lastHealthyAt: subMinutes(NOW, 1), lastCheckedAt: null, isOverloaded: false, packetLoss: null })).toBe(NODE_STATE.up);
  });
});

describe('passedCheck', () => {
  const checkedAt = new Date('2026-10-23T12:00:00Z');

  it('counts a check the node was stamped healthy during', () => {
    expect(passedCheck({ lastHealthyAt: addSeconds(checkedAt, 3), checkedAt })).toBe(true);
  });

  it('does not count a check when the healthy stamp is from an earlier run', () => {
    expect(passedCheck({ lastHealthyAt: subMinutes(checkedAt, 1), checkedAt })).toBe(false);
  });

  it('does not count a check on a node never seen healthy', () => {
    expect(passedCheck({ lastHealthyAt: null, checkedAt })).toBe(false);
  });

  it('agrees with nodeState: a run that passed leaves the node up', () => {
    const lastHealthyAt = addSeconds(checkedAt, 3);

    expect(passedCheck({ lastHealthyAt, checkedAt })).toBe(true);
    expect(nodeState({ lastHealthyAt, lastCheckedAt: checkedAt, isOverloaded: false, packetLoss: null })).toBe(NODE_STATE.up);
  });
});
