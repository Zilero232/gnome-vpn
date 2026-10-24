import { addMilliseconds, addMinutes, subMinutes } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { OWNER_ALERT } from '@/modules/telegram/config';

import type { NodeAlertState } from '../node-health.types';

import { nodeAlert, nodeStatus } from '../node-health';

const START = new Date('2026-10-23T12:00:00.000Z');
const HEALTHY_AT = START;
const SILENT = addMinutes(START, OWNER_ALERT.nodeDownAfterMinutes);

const failAt = (now: Date, state?: NodeAlertState) => nodeAlert({ state, isUp: false, healthyAt: HEALTHY_AT, now });

const recoverAt = (now: Date, state?: NodeAlertState) => nodeAlert({ state, isUp: true, healthyAt: now, now });

describe('nodeAlert', () => {
  it('stays quiet about a failed probe while the node has not been silent for long', () => {
    expect(failAt(subMinutes(SILENT, 1)).alert).toBeNull();
  });

  it('announces a node that has been silent past the threshold', () => {
    expect(failAt(SILENT).alert).toBe('down');
  });

  it('says it once, not on every probe while the node stays down', () => {
    const { state } = failAt(SILENT);

    expect(failAt(addMinutes(SILENT, 1), state).alert).toBeNull();
  });

  it('repeats the warning once the repeat window has passed and the node is still down', () => {
    const { state } = failAt(SILENT);

    expect(failAt(addMilliseconds(SILENT, OWNER_ALERT.repeatMs), state).alert).toBe('down');
  });

  it('announces the recovery of a node it said was down', () => {
    const { state } = failAt(SILENT);

    expect(recoverAt(addMinutes(SILENT, 1), state).alert).toBe('recovered');
  });

  it('says nothing about a recovery nobody was told to wait for', () => {
    expect(recoverAt(START).alert).toBeNull();
  });

  it('does not spam a flapping node: within the window it falls silent after one down and one recovery', () => {
    const down = failAt(SILENT);
    const up = recoverAt(addMinutes(SILENT, 1), down.state);
    const downAgain = failAt(addMinutes(SILENT, 10), up.state);
    const upAgain = recoverAt(addMinutes(SILENT, 11), downAgain.state);

    expect([down.alert, up.alert, downAgain.alert, upAgain.alert]).toEqual(['down', 'recovered', null, null]);
  });

  it('catches up with a node that went down while it was holding back', () => {
    const down = failAt(SILENT);
    const up = recoverAt(addMinutes(SILENT, 1), down.state);
    const suppressed = failAt(addMinutes(SILENT, 10), up.state);

    expect(failAt(addMilliseconds(SILENT, OWNER_ALERT.repeatMs), suppressed.state).alert).toBe('down');
  });
});

describe('nodeStatus', () => {
  it('reports a node switched off by hand as off, however it answers', () => {
    expect(nodeStatus({ isAvailable: false, healthyAt: START, now: START })).toBe('off');
  });

  it('uses the same threshold as the alert, so the stats and the alerts agree', () => {
    expect(nodeStatus({ isAvailable: true, healthyAt: HEALTHY_AT, now: subMinutes(SILENT, 1) })).toBe('up');
    expect(nodeStatus({ isAvailable: true, healthyAt: HEALTHY_AT, now: SILENT })).toBe('down');
  });
});
