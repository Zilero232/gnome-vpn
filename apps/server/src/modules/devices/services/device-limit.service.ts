import { DEFAULT_DEVICE_LIMIT } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';
import { isEmpty, isNonNullish, partition } from 'remeda';

import { isPeriodActive, SUBSCRIPTION_PERIOD_SELECT } from '@/common/lib';
import { PrismaService } from '@/core';
import { peerRevocation } from '@/modules/peers';

import type { RevokePeersInput, SurplusRevocation } from '../devices.types';

import { deviceTitle, isWireguardDevice } from '../lib/device-identity';
import { graceDeviceLimit, slotHolders } from '../lib/device-slots';

@Injectable()
export class DeviceLimitService {
  constructor(private readonly prisma: PrismaService) {}

  async revokeOverLimit(): Promise<SurplusRevocation[]> {
    const crowded = await this.prisma.device.groupBy({
      by: ['userId'],
      _count: { _all: true },
      having: { id: { _count: { gt: DEFAULT_DEVICE_LIMIT } } }
    });

    const revocations: SurplusRevocation[] = [];

    for (const { userId } of crowded) {
      const [subscription, devices] = await Promise.all([
        this.prisma.subscription.findUnique({ where: { userId }, select: SUBSCRIPTION_PERIOD_SELECT }),
        this.prisma.device.findMany({ where: { userId }, select: { id: true, key: true, createdAt: true, model: true, app: true, platform: true } })
      ]);

      const now = new Date();
      const deviceLimit = graceDeviceLimit({ subscription, now });
      const holders = slotHolders({ devices, limit: deviceLimit });
      const surplus = devices.filter((device) => !holders.has(device.id));
      const [tunnels, feeds] = partition(surplus, (device) => isWireguardDevice(device.key));

      const revoked = await this.revokePeers({ deviceIds: feeds.map((device) => device.id), now });
      const removed = await this.removeDevices({ deviceIds: tunnels.map((device) => device.id), now });
      const touched = new Set([...revoked, ...(removed > 0 ? tunnels.map((device) => device.id) : [])]);

      if (!isEmpty(touched)) {
        revocations.push({
          userId,
          deviceLimit,
          isActive: isPeriodActive(subscription?.currentPeriodEnd),
          titles: surplus.filter((device) => touched.has(device.id)).map((device) => deviceTitle(device))
        });
      }
    }

    return revocations;
  }

  private async revokePeers({ deviceIds, now }: RevokePeersInput): Promise<string[]> {
    if (isEmpty(deviceIds)) {
      return [];
    }

    return this.prisma.$transaction(async (tx) => {
      const live = await tx.peer.findMany({
        where: { deviceId: { in: deviceIds }, revokedAt: null },
        distinct: ['deviceId'],
        select: { deviceId: true }
      });

      await tx.peer.updateMany({ where: { deviceId: { in: deviceIds }, revokedAt: null }, data: peerRevocation(now) });

      return live.map((peer) => peer.deviceId).filter(isNonNullish);
    });
  }

  private async removeDevices({ deviceIds, now }: RevokePeersInput): Promise<number> {
    if (isEmpty(deviceIds)) {
      return 0;
    }

    const [, removed] = await this.prisma.$transaction([
      this.prisma.peer.updateMany({ where: { deviceId: { in: deviceIds }, revokedAt: null }, data: peerRevocation(now) }),
      this.prisma.device.deleteMany({ where: { id: { in: deviceIds } } })
    ]);

    return removed.count;
  }
}
