import { describe, expect, it } from 'vitest';

import { peerClientName } from '@/modules/peers';

import type { ActivityPeer } from '../device-activity.types';

import { deviceActivity } from '../device-activity';

const peer = (overrides: Partial<ActivityPeer> = {}): ActivityPeer => ({
  deviceId: 'device-1',
  userId: 'nZTp8U6AtElvrC60yGPq6GBfwLL9kxbX',
  kind: 'config',
  name: 'd-3f2a91c00000',
  nodeId: 'node-1',
  protocol: 'hysteria2',
  ...overrides
});

describe('deviceActivity', () => {
  it('takes the latest moment any of the device clients was online', () => {
    const hysteria = peer();
    const vless = peer({ protocol: 'vless' });
    const lastOnline = new Map([
      [peerClientName(hysteria), new Date('2026-10-20T10:00:00Z')],
      [peerClientName(vless), new Date('2026-10-20T10:05:00Z')]
    ]);

    expect(deviceActivity({ peers: [hysteria, vless], lastOnline })).toEqual(new Map([['device-1', new Date('2026-10-20T10:05:00Z')]]));
  });

  it('skips peers without a device and clients the panel never saw', () => {
    const shared = peer({ deviceId: null });
    const quiet = peer({ deviceId: 'device-2', name: 'd-000000000002' });
    const lastOnline = new Map([[peerClientName(shared), new Date('2026-10-20T10:00:00Z')]]);

    expect(deviceActivity({ peers: [shared, quiet], lastOnline })).toEqual(new Map());
  });
});
