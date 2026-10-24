import type { Logger } from '@nestjs/common';

import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '@/core';
import type { XrayClient } from '@/lib/xray';
import type { ReconcilePeer } from '@/modules/scheduler/jobs/reconcile-peers/reconcile-peers.job.types';

import { DEVICE_KEY } from '@/modules/devices';
import { peerClientName } from '@/modules/peers';

import { releaseFeedWireguard } from '../release-feed-wireguard';

const peer = (overrides: Partial<ReconcilePeer> = {}): ReconcilePeer => ({
  id: 'wg-feed-1',
  deviceId: 'device-1',
  revokedAt: null,
  userId: 'user-1',
  kind: 'config',
  name: 'd-3f2a9c1e7b44',
  nodeId: 'node-1',
  protocol: 'wireguard',
  state: 'active',
  nodeCredential: 'private-key',
  tunnelAddress: '10.8.0.2/32',
  device: { key: 'hwid:abc' },
  user: { subscription: null },
  ...overrides
});

const silentLogger = () => ({ log: vi.fn(), warn: vi.fn() }) as unknown as Logger;

type RunInput = {
  peers: ReconcilePeer[];
  online?: Set<string> | null;
  deleteClient?: ReturnType<typeof vi.fn>;
  deleteMany?: ReturnType<typeof vi.fn>;
};

const run = ({ peers, online = new Set<string>(), deleteClient = vi.fn(), deleteMany = vi.fn() }: RunInput) => {
  deleteClient.mockResolvedValue(undefined);
  deleteMany.mockResolvedValue({ count: peers.length });

  return releaseFeedWireguard({
    prisma: { peer: { deleteMany } } as unknown as PrismaService,
    xray: { deleteClient } as unknown as XrayClient,
    logger: silentLogger(),
    peers,
    nodeClients: new Map(peers.map((each) => [peerClientName(each), true])),
    online
  });
};

describe('releaseFeedWireguard', () => {
  it('releases the WireGuard peer of a subscription-link device, on the node and in the table', async () => {
    const deleteClient = vi.fn();
    const deleteMany = vi.fn();

    const released = await run({ peers: [peer()], deleteClient, deleteMany });

    expect(released.map((each) => each.id)).toEqual(['wg-feed-1']);
    expect(deleteClient).toHaveBeenCalledWith(peerClientName(peer()));
    expect(deleteMany).toHaveBeenCalledWith({ where: { id: { in: ['wg-feed-1'] } } });
  });

  it('never touches a config made on the site or in the bot', async () => {
    const deleteClient = vi.fn();

    expect(await run({ peers: [peer({ device: { key: `${DEVICE_KEY.wireguard}abc` } })], deleteClient })).toEqual([]);
    expect(deleteClient).not.toHaveBeenCalled();
  });

  it('never touches the other protocols of the same device', async () => {
    const deleteClient = vi.fn();

    expect(await run({ peers: [peer({ protocol: 'hysteria2' }), peer({ id: 'vless-1', protocol: 'vless' })], deleteClient })).toEqual([]);
    expect(deleteClient).not.toHaveBeenCalled();
  });

  it('leaves a peer that is carrying a session right now for a later pass', async () => {
    const deleteClient = vi.fn();

    expect(await run({ peers: [peer()], online: new Set([peerClientName(peer())]), deleteClient })).toEqual([]);
    expect(deleteClient).not.toHaveBeenCalled();
  });

  it('does nothing in a pass that does not know who is online', async () => {
    const deleteClient = vi.fn();

    expect(await run({ peers: [peer()], online: null, deleteClient })).toEqual([]);
    expect(deleteClient).not.toHaveBeenCalled();
  });
});
