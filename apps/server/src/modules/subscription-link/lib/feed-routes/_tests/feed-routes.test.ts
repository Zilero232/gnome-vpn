import { subMinutes } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { RELAY_DOWN } from '@/modules/status';

import { feedRoutes, relayOf } from '../feed-routes';

const NOW = new Date('2026-11-11T12:00:00Z');

const direct = { id: 'nl', relayHost: null, relayPort: null, relayHealthyAt: null };
const relayed = { id: 'fi', relayHost: '198.51.100.7', relayPort: 9443, relayHealthyAt: subMinutes(NOW, 1) };

describe('relayOf', () => {
  it('reads the relay a node is served through', () => {
    expect(relayOf(relayed)).toEqual({ host: relayed.relayHost, port: relayed.relayPort });
  });

  it('gives nothing when either half of the relay is missing', () => {
    expect(relayOf(direct)).toBeNull();
    expect(relayOf({ ...relayed, relayPort: null })).toBeNull();
  });
});

describe('feedRoutes', () => {
  it('serves a node without a relay directly', () => {
    expect(feedRoutes({ nodes: [direct], now: NOW })).toEqual([{ node: direct }]);
  });

  it('serves a relayed node only through its relay while the relay passes', () => {
    expect(feedRoutes({ nodes: [relayed], now: NOW })).toEqual([{ node: relayed, endpoint: relayOf(relayed) }]);
  });

  it('trusts a relay that has not been probed yet, so a deploy does not drop every relay', () => {
    const fresh = { ...relayed, relayHealthyAt: null };

    expect(feedRoutes({ nodes: [fresh], now: NOW })[0]?.endpoint).toEqual(relayOf(fresh));
  });

  it('falls back to the node itself once the relay has failed for longer than the grace period', () => {
    const dead = { ...relayed, relayHealthyAt: subMinutes(NOW, RELAY_DOWN.staleMinutes + 1) };

    expect(feedRoutes({ nodes: [dead], now: NOW })).toEqual([{ node: dead }]);
  });

  it('keeps one route per node, in the order the nodes came', () => {
    expect(feedRoutes({ nodes: [relayed, direct], now: NOW }).map((route) => route.node.id)).toEqual([relayed.id, direct.id]);
  });
});
