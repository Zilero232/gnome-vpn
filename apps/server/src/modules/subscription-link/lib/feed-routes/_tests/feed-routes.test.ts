import { describe, expect, it } from 'vitest';

import { feedRoutes, relayOf } from '../feed-routes';

const direct = { id: 'nl', relayHost: null, relayPort: null };
const relayed = { id: 'fi', relayHost: '198.51.100.7', relayPort: 9443 };

describe('relayOf', () => {
  it('reads the relay a node is served through', () => {
    expect(relayOf(relayed)).toEqual({ host: relayed.relayHost, port: relayed.relayPort });
  });

  it('gives nothing when either half of the relay is missing', () => {
    expect(relayOf(direct)).toBeNull();
    expect(relayOf({ relayHost: relayed.relayHost, relayPort: null })).toBeNull();
  });
});

describe('feedRoutes', () => {
  it('serves a node without a relay directly', () => {
    expect(feedRoutes([direct])).toEqual([{ node: direct }]);
  });

  it('serves a relayed node only through its relay, never directly as well', () => {
    expect(feedRoutes([relayed])).toEqual([{ node: relayed, endpoint: relayOf(relayed) }]);
  });

  it('keeps one route per node, in the order the nodes came', () => {
    expect(feedRoutes([relayed, direct]).map((route) => route.node.id)).toEqual([relayed.id, direct.id]);
  });
});
