import { Inject, Injectable, Logger } from '@nestjs/common';
import { Bot } from 'grammy';
import { isNonNullish, isNullish } from 'remeda';

import { describeError } from '@/common/lib';
import { AppConfigService } from '@/config';
import { PrismaService } from '@/core';

import type { AlertAccount, NodeAlertState } from '../lib';
import type {
  ChargeFailedInput,
  NodeLoadInput,
  NodeProbeInput,
  OnceInput,
  PaymentRefundedInput,
  PaymentSettledInput,
  ReconcileFailingInput,
  RefundCanceledInput
} from '../telegram.types';

import { TELEGRAM_BOT } from '../bot';
import { DEFAULT_BOT_LOCALE } from '../config';
import {
  adminChatOf,
  chargeFailedText,
  loadAlertText,
  migratedChatId,
  nodeAlert,
  nodeAlertText,
  nodeLabel,
  paymentAlertText,
  reconcileAlertText,
  refundAlertText
} from '../lib';
import { TelegramThrottleService } from './telegram-throttle.service';

@Injectable()
export class TelegramAlertService {
  private readonly logger = new Logger(TelegramAlertService.name);
  private readonly nodes = new Map<string, NodeAlertState>();

  constructor(
    @Inject(TELEGRAM_BOT) private readonly bot: Bot | null,
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly throttle: TelegramThrottleService
  ) {}

  nodeProbed({ nodeId, isUp, healthyAt }: NodeProbeInput): void {
    const now = new Date();
    const { state, alert } = nodeAlert({ state: this.nodes.get(nodeId), isUp, healthyAt, now });

    this.nodes.set(nodeId, state);

    if (isNullish(alert)) {
      return;
    }

    this.post(async () => nodeAlertText({ alert, node: await this.nodeName(nodeId), healthyAt, now, locale: DEFAULT_BOT_LOCALE }));
  }

  nodeLoad({ nodeId, resource, percent }: NodeLoadInput): void {
    this.once({
      throttle: 'ownerAlert',
      key: `${resource}:${nodeId}`,
      run: () => this.post(async () => loadAlertText({ resource, node: await this.nodeName(nodeId), percent, locale: DEFAULT_BOT_LOCALE }))
    });
  }

  reconcileFailing({ nodeId, streak, error }: ReconcileFailingInput): void {
    this.once({
      throttle: 'ownerAlert',
      key: `reconcile:${nodeId}`,
      run: () => this.post(async () => reconcileAlertText({ node: await this.nodeName(nodeId), streak, error, locale: DEFAULT_BOT_LOCALE }))
    });
  }

  paymentSettled({ userId, purchase, amount, isAutoCharge }: PaymentSettledInput): void {
    this.post(async () => paymentAlertText({ purchase, amount, account: await this.accountOf(userId), isAutoCharge, locale: DEFAULT_BOT_LOCALE }));
  }

  paymentRefunded({ userId, purchase, amount, reason }: PaymentRefundedInput): void {
    this.post(async () => refundAlertText({ purchase, amount, account: await this.accountOf(userId), reason, locale: DEFAULT_BOT_LOCALE }));
  }

  refundCanceled({ paymentId, ...refund }: RefundCanceledInput): void {
    this.once({ throttle: 'refundCanceled', key: paymentId, run: () => this.paymentRefunded({ ...refund, reason: 'canceled' }) });
  }

  chargeFailed({ userId, reason, isCardDropped }: ChargeFailedInput): void {
    this.post(async () => chargeFailedText({ account: await this.accountOf(userId), reason, isCardDropped, locale: DEFAULT_BOT_LOCALE }));
  }

  private once({ throttle, key, run }: OnceInput): void {
    void this.throttle.allow({ throttle, key }).then((isAllowed) => {
      if (isAllowed) {
        run();
      }
    });
  }

  private post(compose: () => Promise<string>): void {
    const bot = this.bot;
    const chatId = adminChatOf(this.config.get('TELEGRAM_ADMIN_CHAT_ID'));

    if (isNullish(bot) || isNullish(chatId)) {
      return;
    }

    compose()
      .then((text) => bot.api.sendMessage(chatId, text))
      .catch((error: unknown) => {
        const migrated = migratedChatId(error);

        if (isNonNullish(migrated)) {
          this.logger.error(`the admin chat became a supergroup — set TELEGRAM_ADMIN_CHAT_ID=${migrated} and restart the server`);

          return;
        }

        this.logger.warn(`could not post an alert to the admin chat: ${describeError(error)}`);
      });
  }

  private async nodeName(nodeId: string): Promise<string> {
    const node = await this.prisma.node.findUnique({ where: { id: nodeId }, select: { country: true, countryCode: true, city: true } });

    return isNullish(node) ? nodeId : nodeLabel({ node, locale: DEFAULT_BOT_LOCALE });
  }

  private async accountOf(userId: string | null): Promise<AlertAccount> {
    if (isNullish(userId)) {
      return { userId, email: null, username: null, telegramId: null };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, telegramAccount: { select: { username: true, telegramId: true } } }
    });

    return {
      userId,
      email: user?.email ?? null,
      username: user?.telegramAccount?.username ?? null,
      telegramId: user?.telegramAccount?.telegramId ?? null
    };
  }
}
