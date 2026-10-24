import { describe, expect, it } from 'vitest';

import { ALERT } from '@/modules/scheduler/config';

import { isOverloaded } from '../node-load';

const CALM = { isHealthy: true, cpu: ALERT.nodeCpuPercent - 1, memoryRatio: ALERT.nodeMemoryRatio - 0.01, tcpCount: 10 };

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
