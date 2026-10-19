import type { WireguardConfigFile, WireguardOverview } from '@gnomevpn/schemas';

import { TUNNEL_PROTOCOL } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { isNullish } from 'remeda';

import type {
  CreateWireguardConfigServiceInput,
  RenderConfigInput,
  SubscriptionNode,
  WireguardConfigFileInput
} from '../subscription-link.service.types';

import { AppBadRequestException, AppNotFoundException, AppServiceUnavailableException } from '../../../common/exceptions';
import { activeDeviceLimit } from '../../../common/lib';
import { PrismaService } from '../../../core';
import { DEVICE_KEY, DEVICE_ORDER, DevicesService } from '../../devices';
import { buildTunnelConfig, hasWireguard, WIREGUARD } from '../../peers';
import { NODE_FEED_SELECT } from '../config';
import { wireguardConf, wireguardFileName, wireguardNodeView } from '../lib';
import { FeedNoticeService } from './feed-notice.service';
import { SubscriptionPeersService } from './subscription-peers.service';

@Injectable()
export class WireguardConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly devices: DevicesService,
    private readonly peers: SubscriptionPeersService,
    private readonly notice: FeedNoticeService
  ) {}

  async overview(userId: string): Promise<WireguardOverview> {
    const [nodes, devices, subscription] = await Promise.all([
      this.wireguardNodes(),
      this.prisma.device.findMany({
        where: { userId },
        orderBy: [...DEVICE_ORDER],
        select: {
          id: true,
          key: true,
          model: true,
          createdAt: true,
          peers: { where: { protocol: TUNNEL_PROTOCOL.wireguard, revokedAt: null }, select: { node: { select: NODE_FEED_SELECT } }, take: 1 }
        }
      }),
      this.prisma.subscription.findUnique({ where: { userId }, select: { currentPeriodEnd: true, extraDevices: true } })
    ]);

    const configs = devices.flatMap((device) => {
      const [peer] = device.peers;

      if (!device.key.startsWith(DEVICE_KEY.wireguard) || isNullish(peer)) {
        return [];
      }

      return [
        {
          deviceId: device.id,
          name: device.model ?? DEVICE_KEY.wireguardApp,
          node: wireguardNodeView(peer.node),
          createdAt: device.createdAt.toISOString()
        }
      ];
    });

    return { nodes: nodes.map(wireguardNodeView), configs, deviceCount: devices.length, deviceLimit: activeDeviceLimit(subscription) };
  }

  async create({ userId, nodeId, name }: CreateWireguardConfigServiceInput): Promise<WireguardConfigFile> {
    const [node, subscription] = await Promise.all([
      this.prisma.node.findFirst({ where: { id: nodeId, isAvailable: true }, select: NODE_FEED_SELECT }),
      this.prisma.subscription.findUnique({ where: { userId }, select: { currentPeriodEnd: true, extraDevices: true } })
    ]);

    if (isNullish(node) || !hasWireguard(node)) {
      throw new AppNotFoundException('NODE_NOT_FOUND', 'No WireGuard server with this id');
    }

    const deviceLimit = activeDeviceLimit(subscription);
    const identity = {
      key: `${DEVICE_KEY.wireguard}${randomUUID()}`,
      hwid: null,
      platform: null,
      model: name,
      osVersion: null,
      app: DEVICE_KEY.wireguardApp
    };

    const admitted = await this.devices.admit({ userId, identity, deviceLimit });

    if (isNullish(admitted.deviceId) || !admitted.isAllowed) {
      throw new AppBadRequestException('DEVICE_LIMIT_REACHED', 'Every device place is taken');
    }

    const deviceId = admitted.deviceId;
    const [peer] = await this.peers.ensureNode({ userId, deviceId, node, canIssue: true, protocols: [TUNNEL_PROTOCOL.wireguard] });

    if (isNullish(peer?.tunnelAddress)) {
      await this.devices.remove({ userId, deviceId });

      throw new AppServiceUnavailableException('NODE_UNAVAILABLE', 'The WireGuard server did not take the new config');
    }

    void this.notice.deviceAdded({ userId, identity, deviceCount: admitted.deviceCount, deviceLimit });

    return this.render({ deviceId, node, peer });
  }

  async file({ userId, deviceId }: WireguardConfigFileInput): Promise<WireguardConfigFile> {
    const peer = await this.prisma.peer.findFirst({
      where: { userId, deviceId, protocol: TUNNEL_PROTOCOL.wireguard, revokedAt: null, device: { key: { startsWith: DEVICE_KEY.wireguard } } },
      select: { protocol: true, nodeCredential: true, tunnelAddress: true, node: { select: NODE_FEED_SELECT } }
    });

    if (isNullish(peer)) {
      throw new AppNotFoundException('DEVICE_NOT_FOUND', 'No WireGuard config with this id');
    }

    const { node, ...feedPeer } = peer;

    return this.render({ deviceId, node, peer: feedPeer });
  }

  private wireguardNodes(): Promise<SubscriptionNode[]> {
    return this.prisma.node.findMany({
      where: { isAvailable: true, wgPublicKey: { not: null } },
      orderBy: { displayOrder: 'asc' },
      select: NODE_FEED_SELECT
    });
  }

  private render({ deviceId, node, peer }: RenderConfigInput): WireguardConfigFile {
    const config = buildTunnelConfig({ node, protocol: TUNNEL_PROTOCOL.wireguard, auth: peer.nodeCredential, address: peer.tunnelAddress });

    if (isNullish(config.wireguard)) {
      throw new AppServiceUnavailableException('NODE_UNAVAILABLE', 'The WireGuard config could not be built');
    }

    return {
      deviceId,
      filename: wireguardFileName({ countryCode: node.countryCode, deviceId }),
      conf: wireguardConf({
        privateKey: config.auth,
        address: config.wireguard.address,
        dns: config.dns,
        mtu: config.wireguard.mtu,
        serverPublicKey: config.wireguard.publicKey,
        host: config.server,
        port: config.port,
        keepAlive: WIREGUARD.keepAlive
      })
    };
  }
}
