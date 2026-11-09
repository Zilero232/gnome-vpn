import { describe, expect, it } from 'vitest';

import { feedRoutes, relayOf } from '../feed-routes';
import { FEED_ROUTE } from '../feed-routes.constants';

const direct = { id: 'nl', relayHost: null, relayPort: null };
const relayed = { id: 'fi', relayHost: '198.51.100.7', relayPort: 9443 };

describe('relayOf', () => {
  it('reads the relay a node is served through', () => {
    expect(relayOf(relayed)).toEqual({ host: '198.51.100.7', port: 9443 });
  });

  it('gives nothing when either half of the relay is missing', () => {
    expect(relayOf(direct)).toBeNull();
    expect(relayOf({ relayHost: '198.51.100.7', relayPort: null })).toBeNull();
  });
});

describe('feedRoutes', () => {
  it('serves a node without a relay once, directly and unlabelled', () => {
    expect(feedRoutes([direct])).toEqual([{ node: direct }]);
  });

  it('serves a relayed node through the relay first and directly as the fallback', () => {
    expect(feedRoutes([relayed])).toEqual([
      { node: relayed, endpoint: { host: '198.51.100.7', port: 9443 } },
      { node: relayed, suffix: FEED_ROUTE.directSuffix }
    ]);
  });

  it('puts every primary route above every fallback, keeping the node order within each', () => {
    const routes = feedRoutes([relayed, direct]);

    expect(routes.map((route) => [route.node.id, route.suffix ?? 'primary'])).toEqual([
      ['fi', 'primary'],
      ['nl', 'primary'],
      ['fi', FEED_ROUTE.directSuffix]
    ]);
  });
});
