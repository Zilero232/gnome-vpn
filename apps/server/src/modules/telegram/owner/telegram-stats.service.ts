import type { Context } from 'grammy';

import { Injectable, Logger } from '@nestjs/common';

import { describeError } from '@/common/lib';
import { AdminStatsService } from '@/modules/admin';

import type { BotStats } from '../shared/owner-text';

import { BOT_TEXT } from '../config';
import { statsText } from '../shared/owner-text';
import { resolveLocale } from '../shared/text';

@Injectable()
export class TelegramStatsService {
  private readonly logger = new Logger(TelegramStatsService.name);

  constructor(private readonly stats: AdminStatsService) {}

  async show(ctx: Context): Promise<void> {
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
