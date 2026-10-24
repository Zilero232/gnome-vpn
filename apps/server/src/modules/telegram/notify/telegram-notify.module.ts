import { Module } from '@nestjs/common';

import { ConsentsModule } from '@/modules/consents';
import { SubscriptionModule } from '@/modules/subscription';

import { telegramBotProvider } from '../bot/telegram-bot.provider';
import { NoticeEmailService } from './notice-email.service';
import { TelegramAlertService } from './telegram-alert.service';
import { TelegramChatsService } from './telegram-chats.service';
import { TelegramNotifyService } from './telegram-notify.service';
import { TelegramThrottleService } from './telegram-throttle.service';

@Module({
  imports: [ConsentsModule, SubscriptionModule],
  providers: [telegramBotProvider, NoticeEmailService, TelegramNotifyService, TelegramAlertService, TelegramThrottleService, TelegramChatsService],
  exports: [TelegramNotifyService, TelegramAlertService, TelegramThrottleService, TelegramChatsService, telegramBotProvider]
})
export class TelegramNotifyModule {}
