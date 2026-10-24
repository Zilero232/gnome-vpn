import type { ApiErrorCode, WireguardConfigFile } from '@gnomevpn/schemas';
import type { Context } from 'grammy';

import { Injectable, Logger } from '@nestjs/common';
import { InputFile } from 'grammy';
import { isNonNullish, isNullish } from 'remeda';

import { describeError, errorCodeOf } from '@/common/lib';
import { SubscriptionService } from '@/modules/subscription';
import { WireguardConfigService } from '@/modules/subscription-link';

import type { BotMessage, BotText, ResolvedChat } from '../telegram.types';
import type { ChatInput, WireguardDocumentInput, WireguardMakeInput, WireguardRefusedInput } from './devices.types';

import { BOT_TEXT, CALLBACK_PREFIX } from '../config';
import { parseUuid, wireguardChoice } from '../shared/callback-data';
import { noAccessMessage } from '../shared/keyboard';
import { TelegramSharedService } from '../shared/telegram-shared.service';
import { wireguardCaption, wireguardKindView, wireguardName, wireguardView } from './device-view';
import { WIREGUARD } from './devices.config';

const REFUSALS: Partial<Record<ApiErrorCode, keyof BotText>> = WIREGUARD.refusals;

@Injectable()
export class TelegramWireguardService {
  private readonly logger = new Logger(TelegramWireguardService.name);
  private readonly creating = new Set<number>();

  constructor(
    private readonly shared: TelegramSharedService,
    private readonly subscription: SubscriptionService,
    private readonly wireguard: WireguardConfigService
  ) {}

  async list(ctx: Context): Promise<void> {
    await this.shared.withUser({
      ctx,
      act: async (chat) => this.shared.reply({ ctx, chat, ...(await this.screen(chat)) })
    });
  }

  async show(ctx: Context): Promise<void> {
    await this.shared.answered({
      ctx,
      prefix: CALLBACK_PREFIX.wireguard,
      act: async ({ chat }) => this.shared.edit({ ctx, ...(await this.screen(chat)) })
    });
  }

  async pickKind(ctx: Context): Promise<void> {
    await this.shared.answered({
      ctx,
      prefix: CALLBACK_PREFIX.wireguardNode,
      act: async ({ chat, value }) => {
        const nodeId = parseUuid(value);

        if (isNullish(nodeId)) {
          return;
        }

        if (!(await this.allowed({ ctx, chat }))) {
          return;
        }

        const overview = await this.wireguard.overview(chat.userId);
        const node = overview.nodes.find((candidate) => candidate.id === nodeId && !candidate.isDown);

        if (overview.deviceCount >= overview.deviceLimit) {
          return this.shared.edit({ ctx, ...wireguardView({ overview, locale: chat.locale }) });
        }

        if (isNullish(node)) {
          return this.shared.edit({ ctx, ...wireguardView({ overview, locale: chat.locale, notice: { key: 'wireguardUnavailable' } }) });
        }

        return this.shared.edit({ ctx, ...wireguardKindView({ node, locale: chat.locale }) });
      }
    });
  }

  async create(ctx: Context): Promise<void> {
    const key = ctx.from?.id;

    if (isNullish(key)) {
      return;
    }

    if (this.creating.has(key)) {
      await this.shared.acknowledge({ ctx, text: this.shared.textFor(ctx).wireguardWait });

      return;
    }

    this.creating.add(key);

    try {
      await this.shared.answered({ ctx, prefix: CALLBACK_PREFIX.wireguardCreate, act: ({ chat, value }) => this.make({ ctx, chat, value }) });
    } finally {
      this.creating.delete(key);
    }
  }

  async file(ctx: Context): Promise<void> {
    await this.shared.answered({
      ctx,
      prefix: CALLBACK_PREFIX.wireguardFile,
      act: async ({ chat, value }) => {
        const deviceId = parseUuid(value);

        if (isNullish(deviceId)) {
          return;
        }

        if (!(await this.allowed({ ctx, chat }))) {
          return;
        }

        try {
          const file = await this.wireguard.file({ userId: chat.userId, deviceId });

          await this.deliver({ ctx, chat, file, how: BOT_TEXT[chat.locale].wireguardHowAny });
        } catch (error) {
          await this.refused({ ctx, chat, error });
        }
      }
    });
  }

  private async make({ ctx, chat, value }: WireguardMakeInput): Promise<void> {
    const choice = wireguardChoice(value);

    if (isNullish(choice)) {
      return;
    }

    if (!(await this.allowed({ ctx, chat }))) {
      return;
    }

    const text = BOT_TEXT[chat.locale];
    const kind = WIREGUARD.kinds[choice.kind];
    const { configs } = await this.wireguard.overview(chat.userId);
    const name = wireguardName({ base: text[kind.name], taken: configs.map((config) => config.name) });

    await this.shared.settle(ctx);
    this.shared.typing(ctx);

    let file: WireguardConfigFile;

    try {
      file = await this.wireguard.create({ userId: chat.userId, nodeId: choice.nodeId, name, shouldAnnounce: false });
    } catch (error) {
      await this.refused({ ctx, chat, error });

      return;
    }

    try {
      await this.deliver({ ctx, chat, file, how: text[kind.how], notice: { key: 'wireguardCreated', fill: { name } } });
    } catch (error) {
      this.logger.warn(`telegram wireguard file was not sent: ${describeError(error)}`);

      await this.shared.reply({ ctx, chat, text: text.wireguardNotSent });
    }
  }

  private async screen(chat: ResolvedChat): Promise<BotMessage> {
    const denied = await this.denied(chat);

    if (isNonNullish(denied)) {
      return denied;
    }

    return wireguardView({ overview: await this.wireguard.overview(chat.userId), locale: chat.locale });
  }

  private async denied(chat: ResolvedChat): Promise<BotMessage | null> {
    const status = await this.subscription.getStatus(chat.userId);

    return status.period === 'none' ? noAccessMessage({ status, locale: chat.locale }) : null;
  }

  private async allowed({ ctx, chat }: ChatInput): Promise<boolean> {
    const denied = await this.denied(chat);

    if (isNonNullish(denied)) {
      await this.shared.edit({ ctx, ...denied });
    }

    return isNullish(denied);
  }

  private async deliver({ ctx, chat, file, how, notice }: WireguardDocumentInput): Promise<void> {
    const overview = await this.wireguard.overview(chat.userId);
    const config = overview.configs.find((entry) => entry.deviceId === file.deviceId);
    const caption = isNonNullish(config) ? wireguardCaption({ config, how, locale: chat.locale }) : undefined;

    if (isNonNullish(notice)) {
      await this.shared.edit({ ctx, ...wireguardView({ overview, locale: chat.locale, notice }) });
    }

    await ctx.replyWithDocument(new InputFile(new TextEncoder().encode(file.conf), file.filename), { caption, parse_mode: 'HTML' });
  }

  private async refused({ ctx, chat, error }: WireguardRefusedInput): Promise<void> {
    const code = errorCodeOf(error);
    const key = isNullish(code) ? undefined : REFUSALS[code];

    if (isNullish(key)) {
      this.logger.warn(`telegram wireguard config failed: ${describeError(error)}`);
    }

    const overview = await this.wireguard.overview(chat.userId);

    await this.shared.edit({ ctx, ...wireguardView({ overview, locale: chat.locale, notice: { key: key ?? 'failed' } }) });
  }
}
