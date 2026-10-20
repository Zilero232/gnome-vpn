import { DEFAULT_DEVICE_LIMIT } from '@gnomevpn/schemas';
import { Logger } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '../../../../../../../core';
import type { XrayClient } from '../../../../../../../lib';
import type { ReconcileNode, ReconcilePeer } from '../../../reconcile-peers.job.types';

import { peerClientName } from '../../../../../../peers';
import { restoreMissing } from '../restore-missing';

const NODE: ReconcileNode = { id: 'node-1', apiUrl: 'http://node', apiTokenEnvVar: 'XRAY_KEY_X' };

const DAY_MS = 24 * 60 * 60 * 1_000;

const peer = (overrides: Partial<ReconcilePeer> = {}): ReconcilePeer => ({
  id: 'peer-1',
  deviceId: null,
  revokedAt: null,
  userId: 'nZTp8U6AtElvrC60yGPq6GBfwLL9kxbX',
  kind: 'config',
  name: 'incy',
  nodeId: NODE.id,
  protocol: 'hysteria2',
  state: 'active',
  nodeCredential: 'the-stored-secret',
  tunnelAddress: null,
  device: null,
  user: { subscription: null },
  ...overrides
});

const silentLogger = () => ({ log: vi.fn(), warn: vi.fn() }) as unknown as Logger;

const fakePrisma = (update = vi.fn()) => ({ peer: { update } }) as unknown as PrismaService;

describe('restoreMissing', () => {
  it('does nothing when the node already holds every peer', async () => {
    const createClient = vi.fn();
    const present = peer();

    const restored = await restoreMissing({
      prisma: fakePrisma(),
      logger: silentLogger(),
      xray: { createClient } as unknown as XrayClient,
      node: NODE,
      peers: [present],
      nodeClients: new Map([[peerClientName(present), true]])
    });

    expect(restored).toBe(0);
    expect(createClient).not.toHaveBeenCalled();
  });

  it('reissues a missing peer with the credential already in the database', async () => {
    const createClient = vi.fn();
    const missing = peer();

    const restored = await restoreMissing({
      prisma: fakePrisma(),
      logger: silentLogger(),
      xray: { createClient } as unknown as XrayClient,
      node: NODE,
      peers: [missing],
      nodeClients: new Map()
    });

    expect(restored).toBe(1);

    expect(createClient).toHaveBeenCalledWith({
      email: peerClientName(missing),
      auth: missing.nodeCredential,
      limitIp: DEFAULT_DEVICE_LIMIT
    });
  });

  it('routes a vless peer to the vless client, so the credential lands as an id', async () => {
    const createVlessClient = vi.fn();
    const missing = peer({ protocol: 'vless' });

    await restoreMissing({
      prisma: fakePrisma(),
      logger: silentLogger(),
      xray: { createVlessClient } as unknown as XrayClient,
      node: NODE,
      peers: [missing],
      nodeClients: new Map()
    });

    expect(createVlessClient).toHaveBeenCalledWith({
      email: peerClientName(missing),
      id: missing.nodeCredential,
      limitIp: DEFAULT_DEVICE_LIMIT
    });
  });

  it('restores a lost vless client even while the hysteria2 client of the same device is still there', async () => {
    const createVlessClient = vi.fn();
    const hysteria = peer({ id: 'peer-hy', name: 'd-abc' });
    const vless = peer({ id: 'peer-vl', name: 'd-abc', protocol: 'vless' });

    const restored = await restoreMissing({
      prisma: fakePrisma(),
      logger: silentLogger(),
      xray: { createVlessClient } as unknown as XrayClient,
      node: NODE,
      peers: [hysteria, vless],
      nodeClients: new Map([[peerClientName(hysteria), true]])
    });

    expect(restored).toBe(1);
    expect(createVlessClient).toHaveBeenCalledWith(expect.objectContaining({ email: peerClientName(vless) }));
  });

  it('restores a lost wireguard client with its stored key and address', async () => {
    const createWireguardClient = vi.fn().mockResolvedValue({ address: '10.9.0.7' });
    const privateKey = Buffer.alloc(32, 7).toString('base64');
    const lost = peer({ protocol: 'wireguard', nodeCredential: privateKey, tunnelAddress: '10.9.0.7' });

    const restored = await restoreMissing({
      prisma: fakePrisma(),
      logger: silentLogger(),
      xray: { createWireguardClient } as unknown as XrayClient,
      node: NODE,
      peers: [lost],
      nodeClients: new Map()
    });

    expect(restored).toBe(1);

    expect(createWireguardClient).toHaveBeenCalledWith(
      expect.objectContaining({ email: peerClientName(lost), privateKey, address: '10.9.0.7', publicKey: expect.stringMatching(/=$/u) })
    );
  });

  it('keeps the address the panel actually gave a restored wireguard client', async () => {
    const update = vi.fn();
    const createWireguardClient = vi.fn().mockResolvedValue({ address: '10.9.0.9' });
    const lost = peer({ id: 'peer-wg', protocol: 'wireguard', nodeCredential: Buffer.alloc(32, 7).toString('base64'), tunnelAddress: null });

    await restoreMissing({
      prisma: fakePrisma(update),
      logger: silentLogger(),
      xray: { createWireguardClient } as unknown as XrayClient,
      node: NODE,
      peers: [lost],
      nodeClients: new Map()
    });

    expect(update).toHaveBeenCalledWith({ where: { id: 'peer-wg' }, data: { tunnelAddress: '10.9.0.9' } });
  });

  it('restores the device limit the owner paid for, not the default one', async () => {
    const createClient = vi.fn();
    const extraDevices = 3;

    const missing = peer({
      user: { subscription: { currentPeriodEnd: new Date(Date.now() + DAY_MS), extraDevices } }
    });

    await restoreMissing({
      prisma: fakePrisma(),
      logger: silentLogger(),
      xray: { createClient } as unknown as XrayClient,
      node: NODE,
      peers: [missing],
      nodeClients: new Map()
    });

    expect(createClient).toHaveBeenCalledWith(expect.objectContaining({ limitIp: DEFAULT_DEVICE_LIMIT + extraDevices }));
  });

  it('falls back to the default limit once the period the extras were bought for has lapsed', async () => {
    const createClient = vi.fn();

    const missing = peer({
      user: { subscription: { currentPeriodEnd: new Date(Date.now() - DAY_MS), extraDevices: 3 } }
    });

    await restoreMissing({
      prisma: fakePrisma(),
      logger: silentLogger(),
      xray: { createClient } as unknown as XrayClient,
      node: NODE,
      peers: [missing],
      nodeClients: new Map()
    });

    expect(createClient).toHaveBeenCalledWith(expect.objectContaining({ limitIp: DEFAULT_DEVICE_LIMIT }));
  });

  it('records what it restored, so a second pass finds nothing to do', async () => {
    const missing = peer();
    const nodeClients = new Map<string, boolean>();

    await restoreMissing({
      prisma: fakePrisma(),
      logger: silentLogger(),
      xray: { createClient: vi.fn() } as unknown as XrayClient,
      node: NODE,
      peers: [missing],
      nodeClients
    });

    expect(nodeClients.get(peerClientName(missing))).toBe(true);
  });

  it('reports no change when every reissue fails', async () => {
    const createClient = vi.fn().mockRejectedValue(new Error('panel refused'));

    const restored = await restoreMissing({
      prisma: fakePrisma(),
      logger: silentLogger(),
      xray: { createClient } as unknown as XrayClient,
      node: NODE,
      peers: [peer()],
      nodeClients: new Map()
    });

    expect(restored).toBe(0);
  });
});
