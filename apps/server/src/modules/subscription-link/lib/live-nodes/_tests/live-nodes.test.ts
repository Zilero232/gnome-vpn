import { subMinutes } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { liveNodes } from '../live-nodes';

const NOW = new Date('2026-10-20T12:00:00.000Z');

const node = (id: string, lastHealthyAt: Date | null) => ({ id, country: id, createdAt: subMinutes(NOW, 60 * 24 * 30), lastHealthyAt });

describe('liveNodes', () => {
  it('leaves out a node whose last healthy probe has gone stale', () => {
    const nodes = [node('nl', subMinutes(NOW, 1)), node('de', subMinutes(NOW, 60))];

    expect(liveNodes({ nodes, now: NOW }).map((each) => each.id)).toEqual(['nl']);
  });

  it('leaves out a node that has never reported', () => {
    const nodes = [node('nl', subMinutes(NOW, 1)), node('de', null)];

    expect(liveNodes({ nodes, now: NOW }).map((each) => each.id)).toEqual(['nl']);
  });

  it('keeps every node when none looks alive, since that means the health probe is down, not the nodes', () => {
    const nodes = [node('nl', subMinutes(NOW, 60)), node('de', null)];

    expect(liveNodes({ nodes, now: NOW })).toEqual(nodes);
  });

  it('answers an empty list for no nodes', () => {
    expect(liveNodes({ nodes: [], now: NOW })).toEqual([]);
  });
});
