import type { TunnelProtocol } from '@gnomevpn/schemas';

import { TUNNEL_PROTOCOL } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { isEmpty, isNonNullish } from 'remeda';

import type { NodeTraffic } from '../../../lib';
import type { EnsureNodeInput, FeedPeer, IssueFeedPeerInput, PersistPeerInput, SubscriptionNode } from '../subscription-link.service.types';

import { describeError } from '../../../common/lib';
import { PrismaService, withSerializableRetry } from '../../../core';
import { DEVICE_PEER, devicePeerName } from '../../devices';
import { hasReality, hasWireguard, peerClientName, PeersService } from '../../peers';
import { NODE_FEED_SELECT } from '../config';
import { NodeTrafficService } from './node-traffic.service';

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

  protocolsFor(node: SubscriptionNode): TunnelProtocol[] {
    return [
      TUNNEL_PROTOCOL.hysteria2,
      ...(hasReality(node) ? [TUNNEL_PROTOCOL.vless] : []),
      ...(hasWireguard(node) ? [TUNNEL_PROTOCOL.wireguard] : [])
    ];
  }

  async ensureNode({
    userId,
    deviceId,
    node,
    canIssue,
    limitIp = DEVICE_PEER.ipsPerClient,
    protocols = this.protocolsFor(node)
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
      select: { userId: true, kind: true, name: true, nodeId: true, protocol: true }
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

    return withSerializableRetry(() =>
      this.prisma.$transaction(
        async (tx) => {
          await tx.peer.upsert({
            where: { userId_kind_name_nodeId_protocol: identity },
            update: { nodeCredential, tunnelAddress, deviceId, revokedAt: null, state: 'active' },
            create: { ...identity, deviceId, nodeCredential, tunnelAddress }
          });
        },
        { isolationLevel: 'Serializable' }
      )
    );
  }
}
