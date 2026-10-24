import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { AutoRenewService } from '@/modules/billing';

@Injectable()
export class RecurringChargeJob {
  constructor(private readonly autoRenew: AutoRenewService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async run(): Promise<void> {
    for (const subscription of await this.autoRenew.dueSubscriptions()) {
      await this.autoRenew.chargeDue(subscription);
    }
  }
}
