import { Injectable, Logger } from '@nestjs/common';
import { isNonNullish, isNullish } from 'remeda';

import { AppServiceUnavailableException } from '@/common/exceptions';
import { describeError } from '@/common/lib';
import { PrismaService } from '@/core';

import type { ResolvedChat, TelegramIdentity } from '../telegram.types';
import type { NotifiedChat, SetBlockedInput, SetLocaleInput } from './notify.types';

import { resolveLocale } from '../shared/text';

@Injectable()
export class TelegramChatsService {
  private readonly logger = new Logger(TelegramChatsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findChat(telegramId: bigint): Promise<ResolvedChat | null> {
    const row = await this.prisma.telegramAccount.findUnique({
      where: { telegramId },
      select: { userId: true, locale: true, languageCode: true }
    });

    if (!row) {
      return null;
    }

    return { userId: row.userId, telegramId, locale: resolveLocale(row.locale ?? row.languageCode) };
  }

  async findChatOrThrow(telegramId: bigint): Promise<ResolvedChat> {
    const chat = await this.findChat(telegramId);

    if (isNullish(chat)) {
      throw new AppServiceUnavailableException('INTERNAL_ERROR', 'The Telegram chat could not be registered');
    }

    return chat;
  }

  async chatOf(userId: string): Promise<NotifiedChat | null> {
    const row = await this.prisma.telegramAccount.findUnique({
      where: { userId },
      select: { telegramId: true, locale: true, languageCode: true, blockedAt: true }
    });

    return isNullish(row)
      ? null
      : { telegramId: row.telegramId, locale: resolveLocale(row.locale ?? row.languageCode), isBlocked: isNonNullish(row.blockedAt) };
  }

  async setLocale({ telegramId, locale }: SetLocaleInput): Promise<void> {
    await this.prisma.telegramAccount.updateMany({ where: { telegramId }, data: { locale } });
  }

  async setBlocked({ telegramId, blockedAt }: SetBlockedInput): Promise<void> {
    await this.prisma.telegramAccount.updateMany({ where: { telegramId }, data: { blockedAt } }).catch((error: unknown) => {
      this.logger.warn(`could not record whether chat ${telegramId} blocked the bot: ${describeError(error)}`);
    });
  }

  async touch({ telegramId, username, languageCode }: TelegramIdentity): Promise<void> {
    await this.prisma.telegramAccount.updateMany({
      where: { telegramId },
      data: { lastSeenAt: new Date(), username, languageCode, blockedAt: null }
    });
  }
}
