import { Module } from '@nestjs/common';

import { SubscriptionModule } from '../subscription';
import { telegramBotProvider } from './bot';
import { NoticeEmailService } from './services/notice-email.service';
import { TelegramAlertService } from './services/telegram-alert.service';
import { TelegramNotifyService } from './services/telegram-notify.service';

@Module({
  imports: [SubscriptionModule],
  providers: [telegramBotProvider, NoticeEmailService, TelegramNotifyService, TelegramAlertService],
  exports: [TelegramNotifyService, TelegramAlertService, telegramBotProvider]
})
export class TelegramNotifyModule {}
