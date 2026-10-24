import type { TelegramStatus } from '@gnomevpn/schemas';

import { isPlaceholderEmail, normaliseShortCode, PERSONAL_DATA_CONSENT_VERSION } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { addMinutes } from 'date-fns';
import { isNonNullish, isNullish } from 'remeda';

import type { PeerRef } from '@/modules/peers';

import { AppBadRequestException, AppServiceUnavailableException } from '@/common/exceptions';
import { describeError, generateShortCode } from '@/common/lib';
import { AppConfigService } from '@/config';
import { isUniqueViolation, PrismaService } from '@/core';
import { IdentityService } from '@/modules/auth';
import { ConsentService } from '@/modules/consents';
import { PEER_REF_SELECT, PeersService } from '@/modules/peers';
import { ReferralService } from '@/modules/referrals';
import { TrialService } from '@/modules/subscription';

import type {
  ConsumeLinkCodeInput,
  EnsuredChat,
  IssueLinkCodeResult,
  LinkedAccount,
  MergeOutcome,
  ResolvedChat,
  SetBlockedInput,
  SetLocaleInput,
  TelegramIdentity,
  UntouchedUserInput
} from '../telegram.types';

import { LINK_CODE } from '../config';
import { resolveLocale } from '../lib';
import { TelegramNotifyService } from './telegram-notify.service';

@Injectable()
export class TelegramLinkService {
  private readonly logger = new Logger(TelegramLinkService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly identity: IdentityService,
    private readonly referrals: ReferralService,
    private readonly trial: TrialService,
    private readonly peers: PeersService,
    private readonly notify: TelegramNotifyService,
    private readonly consents: ConsentService
  ) {}

  async issueCode(userId: string): Promise<IssueLinkCodeResult> {
    const code = generateShortCode();
    const expiresAt = addMinutes(new Date(), LINK_CODE.ttlMinutes);

    await this.prisma.$transaction([
      this.prisma.telegramLinkCode.deleteMany({ where: { userId } }),
      this.prisma.telegramLinkCode.create({ data: { code, userId, expiresAt } })
    ]);

    return {
      code,
      expiresAt: expiresAt.toISOString(),
      botUsername: this.config.get('telegram').botUsername
    };
  }

  async consumeCode({ code, telegramId, username, languageCode }: ConsumeLinkCodeInput): Promise<LinkedAccount> {
    const { account, released } = await this.claimCode({ code, telegramId, username, languageCode });

    await this.peers.releaseDetached(released);

    return account;
  }

  private async claimCode({ code, telegramId, username, languageCode }: ConsumeLinkCodeInput): Promise<MergeOutcome> {
    const normalised = normaliseShortCode(code);

    return this.prisma.$transaction(async (tx) => {
      const claimed = await tx.telegramLinkCode.updateMany({
        where: { code: normalised, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() }
      });

      if (claimed.count === 0) {
        throw new AppBadRequestException('TELEGRAM_CODE_INVALID', 'The code is unknown, already used or expired');
      }

      const { userId } = await tx.telegramLinkCode.findUniqueOrThrow({
        where: { code: normalised },
        select: { userId: true }
      });

      const taken = await tx.telegramAccount.findUnique({
        where: { telegramId },
        select: { userId: true }
      });

      const heldByAnother = isNonNullish(taken) && taken.userId !== userId;
      const heldByEmptyChat = heldByAnother && (await this.isUntouchedTelegramUser({ tx, userId: taken.userId }));

      if (heldByAnother && !heldByEmptyChat) {
        throw new AppBadRequestException('TELEGRAM_ALREADY_LINKED', 'This Telegram account is linked to another subscription');
      }

      await tx.telegramAccount.deleteMany({ where: { userId, telegramId: { not: telegramId } } });

      let released: PeerRef[] = [];

      if (heldByEmptyChat && isNonNullish(taken)) {
        released = await tx.peer.findMany({ where: { userId: taken.userId }, select: PEER_REF_SELECT });

        await this.referrals.adopt({ fromUserId: taken.userId, toUserId: userId, db: tx });
        await this.trial.transfer({ fromUserId: taken.userId, toUserId: userId, db: tx });
        await tx.user.delete({ where: { id: taken.userId } });
      }

      await tx.telegramAccount.upsert({
        where: { telegramId },
        update: { userId, username, languageCode },
        create: { userId, telegramId, username, languageCode }
      });

      return { account: { userId, telegramId, username }, released };
    });
  }

  private async isUntouchedTelegramUser({ tx, userId }: UntouchedUserInput): Promise<boolean> {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        subscription: { select: { currentPeriodEnd: true, trialStartedAt: true, bonusDays: true } },
        _count: {
          select: {
            payments: { where: { status: { not: 'canceled' } } },
            referralsMade: true,
            promoRedemptions: { where: { promoCode: { isAutomatic: false } } }
          }
        }
      }
    });

    if (isNullish(user) || !isPlaceholderEmail(user.email)) {
      return false;
    }

    const subscription = user.subscription;
    const isTrialOnly = isNonNullish(subscription?.trialStartedAt) || isNullish(subscription?.currentPeriodEnd);
    const hasNothingOwed =
      (subscription?.bonusDays ?? 0) === 0 && user._count.payments === 0 && user._count.referralsMade === 0 && user._count.promoRedemptions === 0;

    return isTrialOnly && hasNothingOwed;
  }

  async ensureChat(identity: TelegramIdentity): Promise<EnsuredChat> {
    const existing = await this.findChat(identity.telegramId);

    if (isNonNullish(existing)) {
      return { ...existing, isNew: false };
    }

    const { telegramId, username, languageCode } = identity;
    const userId = await this.identity.createFromTelegram({ telegramId, username });

    try {
      await this.prisma.telegramAccount.create({ data: { userId, telegramId, username, languageCode } });
    } catch (error) {
      if (!isUniqueViolation(error)) {
        throw error;
      }

      await this.identity.deleteUser(userId);

      return { ...(await this.findChatOrThrow(telegramId)), isNew: false };
    }

    await this.consents.recordPersonalData({ userId, version: PERSONAL_DATA_CONSENT_VERSION, source: 'telegram' }).catch((error: unknown) => {
      this.logger.error(`the personal-data consent of ${userId}, created through Telegram, was not recorded: ${describeError(error)}`);
    });

    return { ...(await this.findChatOrThrow(telegramId)), isNew: true };
  }

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

  async setLocale({ telegramId, locale }: SetLocaleInput): Promise<void> {
    await this.prisma.telegramAccount.updateMany({ where: { telegramId }, data: { locale } });
  }

  async status(userId: string): Promise<TelegramStatus> {
    const row = await this.prisma.telegramAccount.findUnique({
      where: { userId },
      select: { username: true }
    });

    return {
      isLinked: Boolean(row),
      username: row?.username ?? null,
      botUsername: this.config.get('telegram').botUsername
    };
  }

  async unlink(userId: string): Promise<void> {
    if (!(await this.identity.hasRealEmail(userId))) {
      throw new AppBadRequestException('TELEGRAM_LAST_SIGN_IN', 'Telegram is the only way into this account');
    }

    await this.notify.farewell(userId);
    await this.prisma.telegramAccount.deleteMany({ where: { userId } });
  }

  private async findChatOrThrow(telegramId: bigint): Promise<ResolvedChat> {
    const chat = await this.findChat(telegramId);

    if (isNullish(chat)) {
      throw new AppServiceUnavailableException('INTERNAL_ERROR', 'The Telegram chat could not be registered');
    }

    return chat;
  }

  async touch({ telegramId, username, languageCode }: TelegramIdentity): Promise<void> {
    await this.prisma.telegramAccount.updateMany({
      where: { telegramId },
      data: { lastSeenAt: new Date(), username, languageCode, blockedAt: null }
    });
  }

  async setBlocked({ telegramId, blockedAt }: SetBlockedInput): Promise<void> {
    await this.prisma.telegramAccount.updateMany({ where: { telegramId }, data: { blockedAt } });
  }
}
