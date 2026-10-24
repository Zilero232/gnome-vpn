import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { BillingModule } from '../billing';
import { ConsentsModule } from '../consents';
import { DevicesModule } from '../devices';
import { PeersModule } from '../peers';
import { PromoCodesModule } from '../promo-codes';
import { StatusModule } from '../status';
import { SubscriptionLinkModule } from '../subscription-link';
import { TelegramNotifyModule } from '../telegram/telegram-notify.module';
import {
  CheckoutReminderJob,
  DeviceSlotsJob,
  ExpiredAccessJob,
  ExpiredRecordsJob,
  GeoFilesJob,
  NodeHealthJob,
  PendingPaymentsJob,
  PeriodReminderJob,
  ReconcilePeersJob,
  RecurringChargeJob,
  SupportThreadsJob,
  WinBackJob
} from './jobs';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BillingModule,
    ConsentsModule,
    DevicesModule,
    PeersModule,
    PromoCodesModule,
    SubscriptionLinkModule,
    TelegramNotifyModule,
    StatusModule
  ],
  providers: [
    CheckoutReminderJob,
    DeviceSlotsJob,
    ExpiredAccessJob,
    ExpiredRecordsJob,
    GeoFilesJob,
    NodeHealthJob,
    PendingPaymentsJob,
    PeriodReminderJob,
    ReconcilePeersJob,
    RecurringChargeJob,
    SupportThreadsJob,
    WinBackJob
  ]
})
export class SchedulerModule {}
