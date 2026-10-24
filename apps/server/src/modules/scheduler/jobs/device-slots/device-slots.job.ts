import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { isEmpty } from 'remeda';

import { describeError } from '@/common/lib';
import { DEVICE_TITLE, DeviceLimitService } from '@/modules/devices';
import { TelegramNotifyService } from '@/modules/telegram/services/telegram-notify.service';

@Injectable()
export class DeviceSlotsJob {
  private readonly logger = new Logger(DeviceSlotsJob.name);

  constructor(
    private readonly deviceLimit: DeviceLimitService,
    private readonly notify: TelegramNotifyService
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async run(): Promise<void> {
    try {
      const revocations = await this.deviceLimit.revokeOverLimit();

      if (isEmpty(revocations)) {
        return;
      }

      this.logger.log(`Revoked the keys of devices over the limit on ${revocations.length} account(s)`);

      await Promise.all(
        revocations
          .filter((revocation) => revocation.isActive)
          .map(({ userId, deviceLimit, titles }) =>
            this.notify.tell({
              userId,
              notice: 'devicesShrunk',
              fill: { limit: String(deviceLimit), names: titles.join(DEVICE_TITLE.listSeparator) }
            })
          )
      );
    } catch (error) {
      this.logger.warn(`Device slot sweep failed: ${describeError(error)}`);
    }
  }
}
