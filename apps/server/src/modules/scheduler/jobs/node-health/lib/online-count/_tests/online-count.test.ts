import { describe, expect, it } from 'vitest';

import type { PeerNameInput } from '@/modules/peers';

import { peerClientName } from '@/modules/peers';

import { onlineCount } from '../online-count';

const peer = (overrides: Partial<PeerNameInput> = {}): PeerNameInput => ({
  userId: 'user-1',
  kind: 'config',
  name: 'd-3f2a91c00000',
  nodeId: 'node-1',
  protocol: 'hysteria2',
  ...overrides
});

describe('onlineCount', () => {
  it('counts every online client, and a user once however many of their clients are online', () => {
    const phone = peer();
    const laptop = peer({ name: 'd-laptop', protocol: 'vless' });
    const other = peer({ userId: 'user-2' });
    const online = new Set([peerClientName(phone), peerClientName(laptop), peerClientName(other)]);

    expect(onlineCount({ peers: [phone, laptop, other], online })).toEqual({ clients: online.size, users: 2 });
  });

  it('counts a client the database does not know as a connection but not as a user', () => {
    const online = new Set(['legacy-client']);

    expect(onlineCount({ peers: [peer()], online })).toEqual({ clients: 1, users: 0 });
  });

  it('leaves offline peers out of the user count', () => {
    expect(onlineCount({ peers: [peer()], online: new Set() })).toEqual({ clients: 0, users: 0 });
  });
});
