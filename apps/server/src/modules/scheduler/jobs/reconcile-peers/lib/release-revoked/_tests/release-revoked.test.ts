import type { Logger } from '@nestjs/common';

import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '@/core';
import type { XrayClient } from '@/lib/xray';
import type { ReconcilePeer } from '@/modules/scheduler/jobs/reconcile-peers/reconcile-peers.job.types';

import { peerClientName } from '@/modules/peers';

import { releaseRevoked } from '../release-revoked';

const peer = (overrides: Partial<ReconcilePeer> = {}): ReconcilePeer => ({
  id: 'peer-1',
  deviceId: null,
  revokedAt: null,
  userId: 'nZTp8U6AtElvrC60yGPq6GBfwLL9kxbX',
  kind: 'config',
  name: 'd-3f2a9c1e7b44',
  nodeId: 'node-1',
  protocol: 'hysteria2',
  state: 'disabled',
  nodeCredential: 'secret',
  tunnelAddress: null,
  device: null,
  ...overrides
});

const stillRevoked = (peers: ReconcilePeer[]) =>
  vi.fn().mockResolvedValue(peers.filter((candidate) => candidate.revokedAt).map((candidate) => ({ id: candidate.id })));

const prismaWith = (deleteMany = vi.fn().mockResolvedValue({ count: 1 }), findMany = vi.fn()) =>
  ({ peer: { deleteMany, findMany } }) as unknown as PrismaService;

const silentLogger = () => ({ log: vi.fn(), warn: vi.fn() }) as unknown as Logger;

describe('releaseRevoked', () => {
  it('leaves the node and the rows alone when nothing is revoked', async () => {
    const deleteClient = vi.fn();
    const deleteMany = vi.fn();

    const released = await releaseRevoked({
      prisma: prismaWith(deleteMany),
      xray: { deleteClient } as unknown as XrayClient,
      logger: silentLogger(),
      peers: [peer()],
      nodeClients: new Map([[peerClientName(peer()), true]])
    });

    expect(released).toBe(0);
    expect(deleteClient).not.toHaveBeenCalled();
    expect(deleteMany).not.toHaveBeenCalled();
  });

  it('deletes a revoked client from the node, then its row', async () => {
    const revoked = peer({ revokedAt: new Date() });
    const email = peerClientName(revoked);
    const deleteClient = vi.fn().mockResolvedValue(undefined);
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const nodeClients = new Map([[email, false]]);

    const released = await releaseRevoked({
      prisma: prismaWith(deleteMany, stillRevoked([revoked])),
      xray: { deleteClient } as unknown as XrayClient,
      logger: silentLogger(),
      peers: [revoked],
      nodeClients
    });

    expect(released).toBe(1);
    expect(deleteClient).toHaveBeenCalledWith(email);
    expect(nodeClients.has(email)).toBe(false);
    expect(deleteMany).toHaveBeenCalledWith({ where: { id: { in: ['peer-1'] }, revokedAt: { not: null } } });
  });

  it('forgets a revoked row whose client the node no longer holds', async () => {
    const deleteClient = vi.fn();
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const revoked = peer({ revokedAt: new Date() });

    const released = await releaseRevoked({
      prisma: prismaWith(deleteMany, stillRevoked([revoked])),
      xray: { deleteClient } as unknown as XrayClient,
      logger: silentLogger(),
      peers: [revoked],
      nodeClients: new Map()
    });

    expect(released).toBe(0);
    expect(deleteClient).not.toHaveBeenCalled();
    expect(deleteMany).toHaveBeenCalledTimes(1);
  });

  it('keeps the rows when the node refuses, so the next pass tries again', async () => {
    const revoked = peer({ revokedAt: new Date() });
    const deleteMany = vi.fn();
    const logger = silentLogger();

    const released = await releaseRevoked({
      prisma: prismaWith(deleteMany, stillRevoked([revoked])),
      xray: { deleteClient: vi.fn().mockRejectedValue(new Error('node down')) } as unknown as XrayClient,
      logger,
      peers: [revoked],
      nodeClients: new Map([[peerClientName(revoked), true]])
    });

    expect(released).toBe(0);
    expect(deleteMany).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it('forgets only the rows whose client is gone when the node refuses some deletions', async () => {
    const kept = peer({ id: 'peer-1', revokedAt: new Date() });
    const gone = peer({ id: 'peer-2', name: 'd-7c1d0e9a2b55', revokedAt: new Date() });
    const deleteClient = vi.fn((email: string) => (email === peerClientName(kept) ? Promise.reject(new Error('node busy')) : Promise.resolve()));
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const nodeClients = new Map([
      [peerClientName(kept), true],
      [peerClientName(gone), true]
    ]);

    const released = await releaseRevoked({
      prisma: prismaWith(deleteMany, stillRevoked([kept, gone])),
      xray: { deleteClient } as unknown as XrayClient,
      logger: silentLogger(),
      peers: [kept, gone],
      nodeClients
    });

    expect(released).toBe(1);
    expect(nodeClients.has(peerClientName(kept))).toBe(true);
    expect(deleteMany).toHaveBeenCalledWith({ where: { id: { in: ['peer-2'] }, revokedAt: { not: null } } });
  });

  it('spares a client the feed issued again since the pass read its row', async () => {
    const reissued = peer({ revokedAt: new Date() });
    const deleteClient = vi.fn();
    const deleteMany = vi.fn();

    const released = await releaseRevoked({
      prisma: prismaWith(deleteMany, vi.fn().mockResolvedValue([])),
      xray: { deleteClient } as unknown as XrayClient,
      logger: silentLogger(),
      peers: [reissued],
      nodeClients: new Map([[peerClientName(reissued), true]])
    });

    expect(released).toBe(0);
    expect(deleteClient).not.toHaveBeenCalled();
    expect(deleteMany).not.toHaveBeenCalled();
  });
});
