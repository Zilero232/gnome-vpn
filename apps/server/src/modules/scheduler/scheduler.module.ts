import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { BillingModule } from '../billing';
import { DevicesModule } from '../devices';
import { StatusModule } from '../status';
import { SubscriptionLinkModule } from '../subscription-link';
import { TelegramNotifyModule } from '../telegram/telegram-notify.module';
import {
  DeviceSlotsJob,
  ExpiredAccessJob,
  GeoFilesJob,
  NodeHealthJob,
  PendingPaymentsJob,
  PeriodReminderJob,
  ReconcilePeersJob,
  RecurringChargeJob,
  SupportThreadsJob
} from './jobs';

@Module({
  imports: [ScheduleModule.forRoot(), BillingModule, DevicesModule, SubscriptionLinkModule, TelegramNotifyModule, StatusModule],
  providers: [
    DeviceSlotsJob,
    ExpiredAccessJob,
    GeoFilesJob,
    NodeHealthJob,
    PendingPaymentsJob,
    PeriodReminderJob,
    ReconcilePeersJob,
    RecurringChargeJob,
    SupportThreadsJob
  ]
})
export class SchedulerModule {}
