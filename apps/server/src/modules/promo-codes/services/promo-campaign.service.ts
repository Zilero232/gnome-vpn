import { CAMPAIGN_KINDS, normalisePromoCode } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { isAfter } from 'date-fns';
import { isNullish } from 'remeda';

import type { CreateCampaignInput } from '../lib';
import type { CampaignSummary, PromoCampaign, StopCampaignInput } from '../promo-codes.types';

import { AppBadRequestException } from '../../../common/exceptions';
import { isPrismaRequestError, PrismaService, UNIQUE_VIOLATION } from '../../../core';
import { CAMPAIGN_LIST, CAMPAIGN_PROBLEM, CAMPAIGN_SELECT } from '../config';
import { campaignDraft, campaignProblem } from '../lib';

@Injectable()
export class PromoCampaignService {
  private readonly logger = new Logger(PromoCampaignService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateCampaignInput): Promise<PromoCampaign> {
    const problem = campaignProblem({ input, now: new Date() });

    if (problem) {
      throw new AppBadRequestException('VALIDATION_FAILED', CAMPAIGN_PROBLEM[problem]);
    }

    const draft = campaignDraft(input);

    try {
      const created = await this.prisma.promoCode.create({ data: draft, select: CAMPAIGN_SELECT });

      this.logger.log(`campaign code ${created.code} created: ${created.kind} ${created.percent ?? created.days}`);

      return created;
    } catch (error) {
      if (isPrismaRequestError(error) && error.code === UNIQUE_VIOLATION) {
        throw new AppBadRequestException('PROMO_CODE_TAKEN', `The code ${draft.code} already exists`);
      }

      throw error;
    }
  }

  async latest(): Promise<CampaignSummary[]> {
    const rows = await this.prisma.promoCode.findMany({
      where: { kind: { in: [...CAMPAIGN_KINDS] } },
      orderBy: { createdAt: 'desc' },
      take: CAMPAIGN_LIST.limit,
      select: { ...CAMPAIGN_SELECT, _count: { select: { redemptions: true } } }
    });

    return rows.map(({ _count, ...campaign }) => ({ ...campaign, used: _count.redemptions }));
  }

  async stop({ code, now }: StopCampaignInput): Promise<boolean> {
    const campaign = await this.prisma.promoCode.findFirst({
      where: { code: normalisePromoCode(code), kind: { in: [...CAMPAIGN_KINDS] } },
      select: { id: true, code: true, expiresAt: true }
    });

    if (isNullish(campaign)) {
      return false;
    }

    if (isNullish(campaign.expiresAt) || isAfter(campaign.expiresAt, now)) {
      await this.prisma.promoCode.update({ where: { id: campaign.id }, data: { expiresAt: now } });
      this.logger.log(`campaign code ${campaign.code} stopped`);
    }

    return true;
  }
}
