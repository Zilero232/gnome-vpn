import { Injectable, Logger } from '@nestjs/common';
import { isEmpty, isNonNullish } from 'remeda';

import type { NodeTraffic } from '@/lib/xray';

import { describeError } from '@/common/lib';
import { PrismaService } from '@/core';
import { DEVICE_PEER, devicePeerName } from '@/modules/devices';
import { feedProtocols, NodeTrafficService, PEER_NAME_SELECT, peerClientName, PeersService } from '@/modules/peers';

import type { EnsureNodeInput, FeedPeer, IssueFeedPeerInput, PersistPeerInput, SubscriptionNode } from '../subscription-link.service.types';

import { NODE_FEED_SELECT } from '../config';

@Injectable()
export class SubscriptionPeersService {
  private readonly logger = new Logger(SubscriptionPeersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly peers: PeersService,
    private readonly nodeTraffic: NodeTrafficService
  ) {}

  availableNodes(): Promise<SubscriptionNode[]> {
    return this.prisma.node.findMany({
      where: { isAvailable: true },
      orderBy: { displayOrder: 'asc' },
      select: NODE_FEED_SELECT
    });
  }

  async ensureNode({
    userId,
    deviceId,
    node,
    canIssue,
    limitIp = DEVICE_PEER.ipsPerClient,
    protocols = feedProtocols(node)
  }: EnsureNodeInput): Promise<FeedPeer[]> {
    const name = devicePeerName(deviceId);

    const existing = await this.prisma.peer.findMany({
      where: { userId, kind: 'config', name, nodeId: node.id, protocol: { in: protocols }, revokedAt: null },
      select: { protocol: true, nodeCredential: true, tunnelAddress: true }
    });

    const missing = protocols.filter((protocol) => !existing.some((peer) => peer.protocol === protocol));

    if (isEmpty(missing) || !canIssue) {
      return existing;
    }

    const issued = await Promise.all(missing.map((protocol) => this.issue({ userId, deviceId, node, protocol, limitIp })));

    return [...existing, ...issued.filter(isNonNullish)];
  }

  async traffic(userId: string): Promise<NodeTraffic> {
    const peers = await this.prisma.peer.findMany({
      where: { userId, kind: 'config', revokedAt: null },
      select: PEER_NAME_SELECT
    });

    return this.nodeTraffic.sum(peers.map((peer) => ({ nodeId: peer.nodeId, email: peerClientName(peer) })));
  }

  private async issue({ userId, deviceId, node, protocol, limitIp }: IssueFeedPeerInput): Promise<FeedPeer | null> {
    const name = devicePeerName(deviceId);

    try {
      const created = await this.peers.issueAndPersist({
        node,
        nodeId: node.id,
        userId,
        kind: 'config',
        protocol,
        limitIp,
        name,
        persist: (peer) =>
          this.persist({ userId, deviceId, name, nodeId: node.id, protocol, nodeCredential: peer.nodeCredential, tunnelAddress: peer.address })
      });

      return { protocol, nodeCredential: created.nodeCredential, tunnelAddress: created.address };
    } catch (error) {
      this.logger.warn(`subscription peer failed on node ${node.id} over ${protocol}: ${describeError(error)}`);

      return null;
    }
  }

  private persist({ userId, deviceId, name, nodeId, protocol, nodeCredential, tunnelAddress }: PersistPeerInput): Promise<void> {
    const identity = { userId, kind: 'config', name, nodeId, protocol } as const;

    return this.prisma.serializable(async (tx) => {
      await tx.peer.upsert({
        where: { userId_kind_name_nodeId_protocol: identity },
        update: { nodeCredential, tunnelAddress, deviceId, revokedAt: null, state: 'active' },
        create: { ...identity, deviceId, nodeCredential, tunnelAddress }
      });
    });
  }
}
