import { normalisePromoCode } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { match } from 'ts-pattern';

import type { BotContext, PromoAnswerInput, PromoCreateInput } from '../telegram.types';

import { describeError, errorCodeOf } from '../../../common/lib';
import { AppConfigService } from '../../../config';
import { campaignProblem, PromoCampaignService } from '../../promo-codes';
import { webPromoLink } from '../../referrals';
import { BOT_TEXT } from '../config';
import { campaignCreatedText, campaignListText, campaignProblemText, fillText, html, parsePromoCommand, resolveLocale } from '../lib';

@Injectable()
export class TelegramPromoService {
  private readonly logger = new Logger(TelegramPromoService.name);

  constructor(
    private readonly campaigns: PromoCampaignService,
    private readonly config: AppConfigService
  ) {}

  async handle(ctx: BotContext): Promise<void> {
    const locale = resolveLocale(ctx.from?.language_code);
    const command = parsePromoCommand(typeof ctx.match === 'string' ? ctx.match : '');

    try {
      await ctx.reply(await this.answer({ command, locale, now: new Date() }));
    } catch (error) {
      this.logger.warn(`telegram /promo failed: ${describeError(error)}`);

      await ctx.reply(BOT_TEXT[locale].failed);
    }
  }

  private async answer({ command, locale, now }: PromoAnswerInput): Promise<string> {
    const text = BOT_TEXT[locale];

    return match(command)
      .with({ action: 'list' }, async () => campaignListText({ campaigns: await this.campaigns.latest(), locale, now }))
      .with({ action: 'stop' }, async ({ code }) => {
        const isStopped = await this.campaigns.stop({ code, now });

        return fillText({ text: isStopped ? text.promoStopped : text.promoNotFound, fill: { code: normalisePromoCode(code) } });
      })
      .with({ action: 'create' }, ({ input }) => this.create({ input, locale, now }))
      .with({ action: 'unknown' }, () => html.paragraphs([text.promoUnknown, text.promoUsage]))
      .exhaustive();
  }

  private async create({ input, locale, now }: PromoCreateInput): Promise<string> {
    const problem = campaignProblem({ input, now });

    if (problem) {
      return campaignProblemText({ problem, locale });
    }

    try {
      const campaign = await this.campaigns.create(input);

      return campaignCreatedText({ campaign, link: webPromoLink({ clientUrl: this.config.get('CLIENT_URL'), code: campaign.code }), locale });
    } catch (error) {
      if (errorCodeOf(error) !== 'PROMO_CODE_TAKEN') {
        throw error;
      }

      return fillText({ text: BOT_TEXT[locale].promoTaken, fill: { code: normalisePromoCode(input.code) } });
    }
  }
}
