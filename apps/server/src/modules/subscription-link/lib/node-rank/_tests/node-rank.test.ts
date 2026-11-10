import { describe, expect, it } from 'vitest';

import { NODE_LOSS } from '@/modules/status';

import { healthyFirst } from '../node-rank';

const node = (id: string, packetLoss: number | null) => ({ id, packetLoss });

describe('healthyFirst', () => {
  it('moves a node that loses packets below every healthy one', () => {
    const nodes = [node('fi', NODE_LOSS.degradedPercent), node('nl', 0)];

    expect(healthyFirst(nodes).map((entry) => entry.id)).toEqual(['nl', 'fi']);
  });

  it('keeps the given order within the healthy and within the lossy nodes', () => {
    const nodes = [node('a', 50), node('b', null), node('c', 0), node('d', NODE_LOSS.degradedPercent)];

    expect(healthyFirst(nodes).map((entry) => entry.id)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('leaves a node below the threshold, or never measured, where it was', () => {
    const nodes = [node('a', NODE_LOSS.degradedPercent - 1), node('b', null)];

    expect(healthyFirst(nodes)).toEqual(nodes);
  });
});
