import { Module } from '@nestjs/common';

import { SubscriptionModule } from '../subscription';
import { telegramBotProvider } from './bot';
import { NoticeEmailService } from './services/notice-email.service';
import { TelegramNotifyService } from './services/telegram-notify.service';

@Module({
  imports: [SubscriptionModule],
  providers: [telegramBotProvider, NoticeEmailService, TelegramNotifyService],
  exports: [TelegramNotifyService, telegramBotProvider]
})
export class TelegramNotifyModule {}
