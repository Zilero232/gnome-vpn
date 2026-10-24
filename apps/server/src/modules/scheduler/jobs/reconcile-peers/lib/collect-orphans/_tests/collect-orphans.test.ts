import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '@/core';
import type { XrayClient } from '@/lib/xray';
import type { ReconcilePeer } from '@/modules/scheduler/jobs/reconcile-peers/reconcile-peers.job.types';

import { peerClientName } from '@/modules/peers';

import { collectOrphans } from '../collect-orphans';

const OWNER = 'nZTp8U6AtElvrC60yGPq6GBfwLL9kxbX';
const STRANGER = 'wwlEUEx5LASlRRfUKoKpa14X1iaChDVV';

const peer = (overrides: Partial<ReconcilePeer> = {}): ReconcilePeer => ({
  id: 'peer-1',
  deviceId: null,
  revokedAt: null,
  userId: OWNER,
  kind: 'config',
  name: 'incy',
  nodeId: 'node-1',
  protocol: 'hysteria2',
  state: 'active',
  nodeCredential: 'secret',
  tunnelAddress: null,
  device: null,
  user: { subscription: null },
  ...overrides
});

const prismaWith = (rows: ReconcilePeer[] = []) => ({ peer: { findMany: vi.fn().mockResolvedValue(rows) } }) as unknown as PrismaService;

const orphanEmail = peerClientName({ userId: STRANGER, kind: 'config', name: 'd-3f2a9c1e7b44', nodeId: 'node-1', protocol: 'hysteria2' });

const collect = (overrides: Partial<Parameters<typeof collectOrphans>[0]>) =>
  collectOrphans({
    prisma: prismaWith(),
    xray: { deleteClient: vi.fn() } as unknown as XrayClient,
    nodeId: 'node-1',
    peers: [],
    nodeClients: new Map([[orphanEmail, true]]),
    online: new Set(),
    ...overrides
  });

describe('collectOrphans', () => {
  it('refuses to delete anything when the node would not say who is online', async () => {
    const deleteClient = vi.fn();

    const collected = await collect({ xray: { deleteClient } as unknown as XrayClient, online: null });

    expect(collected).toBe(0);
    expect(deleteClient).not.toHaveBeenCalled();
  });

  it('deletes an offline client with no peer row, whether or not its owner still exists', async () => {
    const deleteClient = vi.fn();

    const collected = await collect({ xray: { deleteClient } as unknown as XrayClient });

    expect(collected).toBe(1);
    expect(deleteClient).toHaveBeenCalledWith(orphanEmail);
  });

  it('spares a client that is carrying traffic right now, whatever the database says', async () => {
    const deleteClient = vi.fn();

    const collected = await collect({ xray: { deleteClient } as unknown as XrayClient, online: new Set([orphanEmail]) });

    expect(collected).toBe(0);
    expect(deleteClient).not.toHaveBeenCalled();
  });

  it('spares a peer this node is supposed to have', async () => {
    const deleteClient = vi.fn();
    const mine = peer();

    const collected = await collect({
      xray: { deleteClient } as unknown as XrayClient,
      peers: [mine],
      nodeClients: new Map([[peerClientName(mine), true]])
    });

    expect(collected).toBe(0);
    expect(deleteClient).not.toHaveBeenCalled();
  });

  it('spares a client whose row was written after the pass read the node', async () => {
    const deleteClient = vi.fn();
    const fresh = peer({ userId: STRANGER, name: 'd-3f2a9c1e7b44' });

    const collected = await collect({ prisma: prismaWith([fresh]), xray: { deleteClient } as unknown as XrayClient });

    expect(collected).toBe(0);
    expect(deleteClient).not.toHaveBeenCalled();
  });

  it('leaves a client this server never named alone', async () => {
    const deleteClient = vi.fn();

    const collected = await collect({
      xray: { deleteClient } as unknown as XrayClient,
      nodeClients: new Map([['someone-elses-client', true]])
    });

    expect(collected).toBe(0);
    expect(deleteClient).not.toHaveBeenCalled();
  });
});
