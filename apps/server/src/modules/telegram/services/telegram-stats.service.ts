import { Injectable, Logger } from '@nestjs/common';

import type { BotStats } from '../lib';
import type { BotContext } from '../telegram.types';

import { describeError } from '../../../common/lib';
import { AdminStatsService } from '../../admin';
import { BOT_TEXT } from '../config';
import { resolveLocale, statsText } from '../lib';

@Injectable()
export class TelegramStatsService {
  private readonly logger = new Logger(TelegramStatsService.name);

  constructor(private readonly stats: AdminStatsService) {}

  async show(ctx: BotContext): Promise<void> {
    const locale = resolveLocale(ctx.from?.language_code);
    const now = new Date();

    try {
      await ctx.reply(statsText({ stats: await this.collect(now), locale, now }));
    } catch (error) {
      this.logger.warn(`telegram /stats failed: ${describeError(error)}`);

      await ctx.reply(BOT_TEXT[locale].failed);
    }
  }

  private async collect(now: Date): Promise<BotStats> {
    const { nodes, ...snapshot } = await this.stats.collect(now);

    return {
      ...snapshot,
      nodes: nodes.map(({ country, countryCode, city, isAvailable, lastHealthyAt, createdAt }) => ({
        country,
        countryCode,
        city,
        isAvailable,
        healthyAt: lastHealthyAt ?? createdAt
      }))
    };
  }
}
