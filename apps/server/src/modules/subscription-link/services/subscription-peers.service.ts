import type { TunnelProtocol } from '@gnomevpn/schemas';

import { TUNNEL_PROTOCOL } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { isEmpty, isNonNullish, partition } from 'remeda';

import type { NodeTraffic } from '../../../lib';
import type {
  EnsureNodeInput,
  FeedPeer,
  ForgetPeersInput,
  IssueFeedPeerInput,
  NodeTrafficInput,
  OneNodeTrafficInput,
  PersistPeerInput,
  SubscriptionNode
} from '../subscription-link.service.types';

import { describeError, xrayClientForNode } from '../../../common/lib';
import { PrismaService, withSerializableRetry } from '../../../core';
import { NO_TRAFFIC, sumTraffic } from '../../../lib';
import { DEVICE_PEER, devicePeerName } from '../../devices';
import { hasReality, hasWireguard, peerClientName, PeersService } from '../../peers';

@Injectable()
export class SubscriptionPeersService {
  private readonly logger = new Logger(SubscriptionPeersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly peers: PeersService
  ) {}

  protocolsFor(node: SubscriptionNode): TunnelProtocol[] {
    return [
      TUNNEL_PROTOCOL.hysteria2,
      ...(hasReality(node) ? [TUNNEL_PROTOCOL.vless] : []),
      ...(hasWireguard(node) ? [TUNNEL_PROTOCOL.wireguard] : [])
    ];
  }

  async ensureNode({ userId, deviceId, node, canIssue, protocols = this.protocolsFor(node) }: EnsureNodeInput): Promise<FeedPeer[]> {
    const name = devicePeerName(deviceId);

    const existing = await this.prisma.peer.findMany({
      where: { userId, kind: 'config', name, nodeId: node.id, protocol: { in: protocols }, revokedAt: null },
      select: { protocol: true, nodeCredential: true, tunnelAddress: true }
    });

    const missing = protocols.filter((protocol) => !existing.some((peer) => peer.protocol === protocol));

    if (isEmpty(missing) || !canIssue) {
      return existing;
    }

    const issued = (await Promise.all(missing.map((protocol) => this.issue({ userId, deviceId, node, protocol })))).filter(isNonNullish);

    if (isEmpty(issued)) {
      return existing;
    }

    const [live, needRestart] = partition(issued, (peer) => peer.protocol === TUNNEL_PROTOCOL.wireguard);

    if (isEmpty(needRestart)) {
      return [...existing, ...live];
    }

    try {
      await this.peers.restartCore({ node, reason: `issued ${needRestart.length} client(s) for a new device` });
    } catch (error) {
      this.logger.warn(`node ${node.id} did not restart after issuing, its new peers wait for the next fetch: ${describeError(error)}`);

      await this.forget({ userId, name, nodeId: node.id, protocols: needRestart.map((peer) => peer.protocol) });

      return [...existing, ...live];
    }

    return [...existing, ...issued];
  }

  async traffic({ userId, nodes }: NodeTrafficInput): Promise<NodeTraffic> {
    const peers = await this.prisma.peer.findMany({
      where: { userId, kind: 'config', revokedAt: null, nodeId: { in: nodes.map((node) => node.id) } },
      select: { userId: true, kind: true, name: true, nodeId: true, protocol: true }
    });

    const emails = new Set(peers.map((peer) => peerClientName(peer)));

    const perNode = await Promise.all(nodes.map((node) => this.nodeTraffic({ node, emails })));

    return sumTraffic(perNode);
  }

  private async issue({ userId, deviceId, node, protocol }: IssueFeedPeerInput): Promise<FeedPeer | null> {
    const name = devicePeerName(deviceId);

    try {
      const created = await this.peers.issueAndPersist({
        node,
        nodeId: node.id,
        userId,
        kind: 'config',
        protocol,
        limitIp: DEVICE_PEER.ipsPerClient,
        name,
        deferRestart: true,
        persist: (peer) =>
          this.persist({ userId, deviceId, name, nodeId: node.id, protocol, nodeCredential: peer.nodeCredential, tunnelAddress: peer.address })
      });

      return { protocol, nodeCredential: created.nodeCredential, tunnelAddress: created.address };
    } catch (error) {
      this.logger.warn(`subscription peer failed on node ${node.id} over ${protocol}: ${describeError(error)}`);

      return null;
    }
  }

  private async forget({ userId, name, nodeId, protocols }: ForgetPeersInput): Promise<void> {
    await this.prisma.peer.deleteMany({ where: { userId, kind: 'config', name, nodeId, protocol: { in: protocols } } }).catch((error: unknown) => {
      this.logger.warn(`unrestarted peers on node ${nodeId} were not forgotten: ${describeError(error)}`);
    });
  }

  private async nodeTraffic({ node, emails }: OneNodeTrafficInput): Promise<NodeTraffic> {
    try {
      return await xrayClientForNode(node).trafficFor(emails);
    } catch (error) {
      this.logger.warn(`traffic unavailable on node ${node.id}: ${describeError(error)}`);

      return NO_TRAFFIC;
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
