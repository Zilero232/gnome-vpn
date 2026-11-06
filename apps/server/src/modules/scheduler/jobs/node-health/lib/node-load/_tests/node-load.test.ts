import { describe, expect, it } from 'vitest';

import type { NodeHealth } from '@/lib/xray';

import { ALERT } from '@/modules/scheduler/config';

import { isOverloaded, isSustainedLoad, nextLoadStreak } from '../node-load';

const CALM: NodeHealth = {
  isHealthy: true,
  cpu: ALERT.nodeCpuPercent - 1,
  memoryRatio: ALERT.nodeMemoryRatio - 0.01,
  tcpCount: 10,
  bootedAt: null,
  coreStartedAt: null
};

describe('isOverloaded', () => {
  it('leaves a node under both alert thresholds alone', () => {
    expect(isOverloaded(CALM)).toBe(false);
  });

  it('flags a node at the CPU alert threshold', () => {
    expect(isOverloaded({ ...CALM, cpu: ALERT.nodeCpuPercent })).toBe(true);
  });

  it('flags a node at the memory alert threshold', () => {
    expect(isOverloaded({ ...CALM, memoryRatio: ALERT.nodeMemoryRatio })).toBe(true);
  });

  it('does not guess a load the panel did not report', () => {
    expect(isOverloaded({ ...CALM, cpu: null, memoryRatio: null })).toBe(false);
  });
});

describe('nextLoadStreak', () => {
  it('counts the minutes a resource stays over its threshold', () => {
    expect(nextLoadStreak({ previous: 2, isHot: true })).toBe(3);
  });

  it('starts over the moment the resource cools down', () => {
    expect(nextLoadStreak({ previous: 5, isHot: false })).toBe(0);
  });
});

describe('isSustainedLoad', () => {
  it('stays quiet about a spike shorter than the streak, like a nightly package update', () => {
    expect(isSustainedLoad(ALERT.loadStreakMinutes - 1)).toBe(false);
  });

  it('speaks once the load has held for the whole streak', () => {
    expect(isSustainedLoad(ALERT.loadStreakMinutes)).toBe(true);
  });
});
