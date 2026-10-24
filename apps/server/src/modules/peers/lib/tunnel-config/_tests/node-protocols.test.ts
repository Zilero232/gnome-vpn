import { TUNNEL_PROTOCOL } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { feedProtocols, nodeProtocols } from '../tunnel-config';

const BARE = { realityPublicKey: null, realityShortId: null, wgPublicKey: null };

describe('nodeProtocols', () => {
  it('always offers Hysteria2, the protocol every node is provisioned with', () => {
    expect(nodeProtocols(BARE)).toEqual([TUNNEL_PROTOCOL.hysteria2]);
  });

  it('offers VLESS only once the node holds both Reality keys', () => {
    expect(nodeProtocols({ ...BARE, realityPublicKey: 'pub' })).not.toContain(TUNNEL_PROTOCOL.vless);
    expect(nodeProtocols({ ...BARE, realityPublicKey: 'pub', realityShortId: 'ab' })).toContain(TUNNEL_PROTOCOL.vless);
  });

  it('offers WireGuard once the node has a WireGuard key', () => {
    expect(nodeProtocols({ ...BARE, wgPublicKey: 'wg' })).toContain(TUNNEL_PROTOCOL.wireguard);
  });

  it('lists the protocols in the order the site presents them', () => {
    const full = nodeProtocols({ realityPublicKey: 'pub', realityShortId: 'ab', wgPublicKey: 'wg' });

    expect(full).toEqual(Object.values(TUNNEL_PROTOCOL));
  });
});

describe('feedProtocols', () => {
  it('is what the node offers, less WireGuard, which the feed never serves', () => {
    const full = { realityPublicKey: 'pub', realityShortId: 'ab', wgPublicKey: 'wg' };

    expect(feedProtocols(full)).toEqual(nodeProtocols(full).filter((protocol) => protocol !== TUNNEL_PROTOCOL.wireguard));
  });

  it('serves VLESS beside Hysteria2 only once the node holds both Reality keys', () => {
    expect(feedProtocols(BARE)).toEqual([TUNNEL_PROTOCOL.hysteria2]);
    expect(feedProtocols({ ...BARE, realityPublicKey: 'pub', realityShortId: 'ab' })).toEqual([TUNNEL_PROTOCOL.hysteria2, TUNNEL_PROTOCOL.vless]);
  });
});
