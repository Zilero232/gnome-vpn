import { TUNNEL_PROTOCOL } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { groupBy, isEmpty } from 'remeda';
import { match } from 'ts-pattern';

import type {
  CreatedPeer,
  DeleteClientInput,
  DiscardPeerInput,
  ForEachNodeInput,
  IssueAndPersistInput,
  IssuedCredential,
  IssuePeerInput,
  PeerRef,
  RestartCoreInput,
  SetPeerEnabledInput
} from '../peers.service.types';

import { AppServiceUnavailableException } from '../../../common/exceptions';
import { describeError, IDENTIFIED_NODE_SELECT, xrayClientForNode } from '../../../common/lib';
import { PrismaService } from '../../../core';
import { generateWireguardKeys, isWireguardClient, peerClientName } from '../lib';

@Injectable()
export class PeersService {
  private readonly logger = new Logger(PeersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async issueAndPersist({ persist, ...input }: IssueAndPersistInput): Promise<CreatedPeer> {
    const created = await this.issue(input);

    try {
      await persist(created);
    } catch (error) {
      await this.discard({ node: input.node, email: created.email });

      throw error;
    }

    return created;
  }

  async issue({ node, nodeId, userId, kind, protocol, limitIp, name, deferRestart }: IssuePeerInput): Promise<CreatedPeer> {
    const email = peerClientName({ userId, kind, name, nodeId, protocol });
    const client = xrayClientForNode(node);

    const create = match(protocol)
      .returnType<() => Promise<IssuedCredential>>()
      .with(TUNNEL_PROTOCOL.vless, () => () => client.createVlessClient({ email, limitIp, deferRestart }))
      .with(TUNNEL_PROTOCOL.wireguard, () => () => client.createWireguardClient({ email, limitIp, ...generateWireguardKeys() }))
      .otherwise(() => () => client.createClient({ email, limitIp, deferRestart }));

    try {
      const created = await create();

      return { nodeCredential: created.nodeCredential, address: created.address ?? null, email, protocol };
    } catch (error) {
      this.logger.error(`issuing a ${protocol} client failed on node ${nodeId}: ${describeError(error)}`);

      throw new AppServiceUnavailableException('NODE_UNAVAILABLE', 'xray node unreachable');
    }
  }

  private async forEachNode<TPeer extends { nodeId: string }>({ peers, run }: ForEachNodeInput<TPeer>): Promise<void> {
    const byNode = groupBy(peers, (peer) => peer.nodeId);

    const nodes = await this.prisma.node.findMany({
      where: { id: { in: Object.keys(byNode) } },
      select: IDENTIFIED_NODE_SELECT
    });

    await Promise.all(nodes.map((node) => run({ client: xrayClientForNode(node), peers: byNode[node.id] ?? [] })));
  }

  private async deleteFromNodes(peers: PeerRef[]): Promise<void> {
    await this.forEachNode<PeerRef>({
      peers,
      run: async ({ client, peers: nodePeers }) => {
        const emails = nodePeers.map((peer) => peerClientName(peer));

        await Promise.all(emails.map((email) => this.deleteClient({ client, email })));

        if (emails.some((email) => !isWireguardClient(email))) {
          await client.restartCore(`released ${emails.length} client(s) of a deleted account`).catch((error: unknown) => {
            this.logger.warn(`a node did not restart after releasing an account: ${describeError(error)}`);
          });
        }
      }
    });
  }

  private async deleteClient({ client, email }: DeleteClientInput): Promise<void> {
    await client.deleteClient(email).catch((error: unknown) => {
      this.logger.warn(`could not delete ${email} on its node: ${describeError(error)}`);
    });
  }

  async releaseDetached(peers: PeerRef[]): Promise<void> {
    if (isEmpty(peers)) {
      return;
    }

    await this.prisma.peer.deleteMany({
      where: { id: { in: peers.map((peer) => peer.id) } }
    });

    void this.deleteFromNodes(peers).catch((error: unknown) => {
      this.logger.warn(`could not release peers on their node: ${describeError(error)}`);
    });
  }

  async setEnabled({ where, enabled }: SetPeerEnabledInput): Promise<number> {
    const { count } = await this.prisma.peer.updateMany({
      where,
      data: { state: enabled ? 'active' : 'disabled' }
    });

    return count;
  }

  async pushEnabled(userId: string): Promise<void> {
    const peers = await this.prisma.peer.findMany({
      where: { userId, kind: 'config', revokedAt: null, state: 'active' },
      select: { userId: true, kind: true, name: true, nodeId: true, protocol: true }
    });

    await this.forEachNode({
      peers,
      run: async ({ client, peers: nodePeers }) => {
        try {
          const onNode = await client.clientEnabledByEmail();
          const emails = nodePeers.map((peer) => peerClientName(peer)).filter((email) => onNode.get(email) === false);

          if (isEmpty(emails)) {
            return;
          }

          const needsRestart = await client.setClientsEnabled({ emails, enabled: true });

          if (needsRestart) {
            await client.restartCore(`enabled ${emails.length} client(s) of a renewed account`);
          }
        } catch (error) {
          this.logger.warn(`could not enable the clients of ${userId} on a node, the sweep will: ${describeError(error)}`);
        }
      }
    });
  }

  async restartCore({ node, reason }: RestartCoreInput): Promise<void> {
    await xrayClientForNode(node).restartCore(reason);
  }

  async discard({ node, email }: DiscardPeerInput): Promise<void> {
    await this.deleteClient({ client: xrayClientForNode(node), email });
  }
}
