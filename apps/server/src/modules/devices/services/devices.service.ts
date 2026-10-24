import type { DeviceList } from '@gnomevpn/schemas';

import { Injectable } from '@nestjs/common';
import { isNonNullish, omit, pickBy } from 'remeda';

import { AppNotFoundException } from '@/common/exceptions';
import { activeDeviceLimit, SUBSCRIPTION_PERIOD_SELECT } from '@/common/lib';
import { isUniqueViolation, PrismaService } from '@/core';
import { peerRevocation } from '@/modules/peers';

import type { AdmitDeviceInput, AdmittedDevice, RemoveDeviceInput } from '../devices.types';

import { DEVICE_KEY, DEVICE_ORDER } from '../config';
import { slotHolders } from '../lib/device-slots';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async admit(input: AdmitDeviceInput): Promise<AdmittedDevice> {
    try {
      return await this.claimSlot(input);
    } catch (error) {
      if (isUniqueViolation(error)) {
        return this.claimSlot(input);
      }

      throw error;
    }
  }

  async limitOf(userId: string): Promise<number> {
    const subscription = await this.prisma.subscription.findUnique({ where: { userId }, select: SUBSCRIPTION_PERIOD_SELECT });

    return activeDeviceLimit(subscription);
  }

  async list(userId: string): Promise<DeviceList> {
    const [deviceLimit, devices] = await Promise.all([
      this.limitOf(userId),
      this.prisma.device.findMany({ where: { userId }, orderBy: [...DEVICE_ORDER] })
    ]);

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

      await tx.peer.updateMany({ where: { deviceId, revokedAt: null }, data: peerRevocation(new Date()) });

      await tx.device.delete({ where: { id: deviceId } });
    });
  }

  private claimSlot({ userId, identity, deviceLimit, canRegister = true }: AdmitDeviceInput): Promise<AdmittedDevice> {
    const { key, ...details } = omit(identity, ['hwid']);

    return this.prisma.serializable(async (tx) => {
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
    });
  }
}
