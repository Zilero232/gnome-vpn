import { autoRetry } from '@grammyjs/auto-retry';
import { Bot } from 'grammy';

import { AppConfigService } from '@/config';

import { BOT_API } from '../config';
import { retryNetworkErrors } from './transformers/network-retry';
import { sendDefaults } from './transformers/send-defaults';

export const TELEGRAM_BOT = Symbol('TELEGRAM_BOT');

export const telegramBotProvider = {
  provide: TELEGRAM_BOT,
  useFactory: (config: AppConfigService): Bot | null => {
    const token = config.get('telegram').botToken;

    if (!token) {
      return null;
    }

    const bot = new Bot(token, { client: { timeoutSeconds: BOT_API.timeoutSeconds } });

    bot.api.config.use(retryNetworkErrors);

    bot.api.config.use(
      autoRetry({ maxRetryAttempts: BOT_API.calls.retries, maxDelaySeconds: BOT_API.calls.maxDelaySeconds, rethrowHttpErrors: true })
    );

    bot.api.config.use(sendDefaults);

    return bot;
  },
  inject: [AppConfigService]
};
