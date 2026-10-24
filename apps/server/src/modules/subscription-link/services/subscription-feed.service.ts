import { Injectable, Logger } from '@nestjs/common';
import { isEmpty, isNonNullish, isNullish, zip } from 'remeda';

import { AppNotFoundException } from '@/common/exceptions';
import { activeDeviceLimit, describeError, isPeriodActive, SUBSCRIPTION_PERIOD_SELECT } from '@/common/lib';
import { AppConfigService } from '@/config';
import { PrismaService } from '@/core';
import { NO_TRAFFIC } from '@/lib/xray';
import { DEVICE_HEADER, deviceIdentity, deviceIpLimit, DevicesService, headerOf, isKeylessIncy } from '@/modules/devices';
import { buildTunnelConfig, feedProtocols } from '@/modules/peers';

import type { BuildFeedInput, ServerUrisInput, SubscriptionBody, TouchLinkInput } from '../subscription-link.service.types';

import { ROUTING_SELECT } from '../config';
import { announcement, clientPlatform, hwidHint, incyHeaders, incyRouting, incyServerUri, isClientFetch, liveNodes, tlsMode } from '../lib';
import { FeedNoticeService } from './feed-notice.service';
import { SubscriptionPeersService } from './subscription-peers.service';

@Injectable()
export class SubscriptionFeedService {
  private readonly logger = new Logger(SubscriptionFeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionPeers: SubscriptionPeersService,
    private readonly devices: DevicesService,
    private readonly notice: FeedNoticeService,
    private readonly config: AppConfigService
  ) {}

  async build({ token, headers }: BuildFeedInput): Promise<SubscriptionBody> {
    const link = await this.prisma.subscriptionLink.findUnique({
      where: { token },
      select: { userId: true, ...ROUTING_SELECT.stored, user: { select: { subscription: { select: SUBSCRIPTION_PERIOD_SELECT } } } }
    });

    if (!link) {
      throw new AppNotFoundException('SUBSCRIPTION_LINK_NOT_FOUND', 'Unknown subscription token');
    }

    const identity = deviceIdentity(headers);
    const isKeyless = isKeylessIncy(identity);
    const userAgent = headerOf({ headers, name: DEVICE_HEADER.userAgent });
    const isClient = isClientFetch({ headers, hwid: identity.hwid });

    if (isClient) {
      void this.touch({ token, userAgent });
    } else {
      this.logger.debug(`a non-client fetch of a feed was served no servers: ${userAgent ?? 'no user agent'}`);
    }

    const now = new Date();
    const subscription = link.user.subscription;
    const currentPeriodEnd = subscription?.currentPeriodEnd ?? null;
    const canAdmit = isPeriodActive(currentPeriodEnd) && isClient;
    const deviceLimit = activeDeviceLimit(subscription);
    const nodes = await this.subscriptionPeers.availableNodes();
    const live = liveNodes({ nodes, now });

    const admitted = canAdmit ? await this.devices.admit({ userId: link.userId, identity, deviceLimit, canRegister: !isKeyless }) : null;
    const deviceId = admitted?.isAllowed ? admitted.deviceId : null;
    const needsHwid = isKeyless && isNonNullish(admitted) && isNullish(admitted.deviceId);
    const isBlocked = isNonNullish(admitted) && !admitted.isAllowed && !needsHwid;

    if (admitted?.isNew) {
      void this.notice.deviceAdded({ userId: link.userId, identity, deviceCount: admitted.deviceCount, deviceLimit });
    }

    if (isBlocked) {
      void this.notice.deviceBlocked({ token, userId: link.userId, identity, deviceLimit }).catch((error: unknown) => {
        this.logger.warn(`device-limit notice failed: ${describeError(error)}`);
      });
    }

    const issuable = new Set(live.map((node) => node.id));
    const uris = isNonNullish(deviceId)
      ? await this.serverUris({ userId: link.userId, deviceId, nodes, tls: tlsMode(userAgent), issuable, limitIp: deviceIpLimit(identity.key) })
      : [];

    const expected = live.flatMap((node) => feedProtocols(node)).length;

    if (isNonNullish(deviceId) && uris.length < expected) {
      this.logger.warn(`feed for ${link.userId} served ${uris.length} of ${expected} servers to device ${deviceId}`);
    }

    const traffic = canAdmit ? await this.subscriptionPeers.traffic(link.userId) : NO_TRAFFIC;
    const routing = isNonNullish(deviceId) ? incyRouting({ app: identity.app, stored: link, apiUrl: this.config.get('API_URL') }) : null;
    const lines = isNonNullish(routing) ? [...uris, routing.line] : uris;

    return {
      body: Buffer.from(lines.join('\n'), 'utf8').toString('base64'),
      headers: {
        ...incyHeaders({
          currentPeriodEnd,
          traffic,
          clientUrl: this.config.get('CLIENT_URL'),
          supportUrl: this.config.get('SUPPORT_URL') || null,
          announce: announcement({
            nodes,
            hasSubscription: isNonNullish(subscription),
            currentPeriodEnd,
            blockedAtLimit: isBlocked ? deviceLimit : null,
            hwidHint: hwidHint({ needsHwid, isKeyless, deviceId }),
            isPreparing: isNonNullish(deviceId) && isEmpty(uris) && !isEmpty(nodes),
            now
          })
        }),
        ...routing?.headers
      }
    };
  }

  private async touch({ token, userAgent }: TouchLinkInput): Promise<void> {
    try {
      await this.prisma.subscriptionLink.update({
        where: { token },
        data: { lastSeenAt: new Date(), lastPlatform: clientPlatform(userAgent) }
      });
    } catch (error) {
      this.logger.warn(`subscription touch failed: ${describeError(error)}`);
    }
  }

  private async serverUris({ userId, deviceId, nodes, tls, issuable, limitIp }: ServerUrisInput): Promise<string[]> {
    const issued = await Promise.all(
      nodes.map((node) => this.subscriptionPeers.ensureNode({ userId, deviceId, node, canIssue: issuable.has(node.id), limitIp }))
    );

    return zip(nodes, issued)
      .flatMap(([node, peers]) =>
        feedProtocols(node).map((protocol) => {
          const peer = peers.find((candidate) => candidate.protocol === protocol);

          if (!peer) {
            return null;
          }

          const config = buildTunnelConfig({ node, protocol, auth: peer.nodeCredential, address: peer.tunnelAddress });

          return incyServerUri({ config, country: node.country, countryCode: node.countryCode, city: node.city, tls });
        })
      )
      .filter(isNonNullish);
  }
}
