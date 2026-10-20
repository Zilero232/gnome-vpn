import type { DeviceList } from '@gnomevpn/schemas';

import { DEFAULT_DEVICE_LIMIT } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';
import { isEmpty, isNonNullish, partition, pickBy } from 'remeda';

import type { AdmitDeviceInput, AdmittedDevice, RemoveDeviceInput, RevokePeersInput, SurplusRevocation } from '../devices.types';

import { AppNotFoundException } from '../../../common/exceptions';
import { activeDeviceLimit, isPeriodActive, SUBSCRIPTION_PERIOD_SELECT } from '../../../common/lib';
import { isPrismaRequestError, PrismaService, UNIQUE_VIOLATION, withSerializableRetry } from '../../../core';
import { DEVICE_KEY, DEVICE_ORDER } from '../config';
import { deviceTitle, graceDeviceLimit, slotHolders } from '../lib';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async admit(input: AdmitDeviceInput): Promise<AdmittedDevice> {
    try {
      return await this.claimSlot(input);
    } catch (error) {
      if (isPrismaRequestError(error) && error.code === UNIQUE_VIOLATION) {
        return this.claimSlot(input);
      }

      throw error;
    }
  }

  private claimSlot({ userId, identity, deviceLimit, canRegister = true }: AdmitDeviceInput): Promise<AdmittedDevice> {
    const { key, ...details } = identity;

    return withSerializableRetry(() =>
      this.prisma.$transaction(
        async (tx) => {
          const devices = await tx.device.findMany({
            where: { userId },
            orderBy: [...DEVICE_ORDER],
            select: { id: true, key: true, createdAt: true }
          });

          const existing = devices.find((device) => device.key === key);

          if (existing) {
            await tx.device.update({ where: { id: existing.id }, data: { ...pickBy(details, isNonNullish), lastSeenAt: new Date() } });

            return {
              deviceId: existing.id,
              isAllowed: slotHolders({ devices, limit: deviceLimit }).has(existing.id),
              isNew: false,
              deviceCount: devices.length
            };
          }

          if (!canRegister || devices.length >= deviceLimit) {
            return { deviceId: null, isAllowed: false, isNew: false, deviceCount: devices.length };
          }

          const created = await tx.device.create({ data: { userId, key, ...details }, select: { id: true } });

          return { deviceId: created.id, isAllowed: true, isNew: true, deviceCount: devices.length + 1 };
        },
        { isolationLevel: 'Serializable' }
      )
    );
  }

  async list(userId: string): Promise<DeviceList> {
    const [subscription, devices] = await Promise.all([
      this.prisma.subscription.findUnique({ where: { userId }, select: SUBSCRIPTION_PERIOD_SELECT }),
      this.prisma.device.findMany({ where: { userId }, orderBy: [...DEVICE_ORDER] })
    ]);

    const deviceLimit = activeDeviceLimit(subscription);
    const holders = slotHolders({ devices, limit: deviceLimit });

    return {
      deviceLimit,
      devices: devices.map((device) => ({
        id: device.id,
        model: device.model,
        platform: device.platform,
        osVersion: device.osVersion,
        app: device.app,
        isIdentified: device.key.startsWith(DEVICE_KEY.hwid),
        isOverLimit: !holders.has(device.id),
        createdAt: device.createdAt.toISOString(),
        lastSeenAt: device.lastSeenAt.toISOString()
      }))
    };
  }

  async remove({ userId, deviceId }: RemoveDeviceInput): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const device = await tx.device.findFirst({ where: { id: deviceId, userId }, select: { id: true } });

      if (!device) {
        throw new AppNotFoundException('DEVICE_NOT_FOUND', 'No such device on this account');
      }

      await tx.peer.updateMany({
        where: { deviceId, revokedAt: null },
        data: { revokedAt: new Date(), state: 'disabled' }
      });

      await tx.device.delete({ where: { id: deviceId } });
    });
  }

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
      const [tunnels, feeds] = partition(surplus, (device) => device.key.startsWith(DEVICE_KEY.wireguard));

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

      await tx.peer.updateMany({
        where: { deviceId: { in: deviceIds }, revokedAt: null },
        data: { revokedAt: now, state: 'disabled' }
      });

      return live.map((peer) => peer.deviceId).filter(isNonNullish);
    });
  }

  private async removeDevices({ deviceIds, now }: RevokePeersInput): Promise<number> {
    if (isEmpty(deviceIds)) {
      return 0;
    }

    const [, removed] = await this.prisma.$transaction([
      this.prisma.peer.updateMany({
        where: { deviceId: { in: deviceIds }, revokedAt: null },
        data: { revokedAt: now, state: 'disabled' }
      }),
      this.prisma.device.deleteMany({ where: { id: { in: deviceIds } } })
    ]);

    return removed.count;
  }
}
