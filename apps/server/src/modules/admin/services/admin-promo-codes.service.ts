import type { AdminCampaign, AdminCampaignPage, AdminGiftPage } from '@gnomevpn/schemas';

import { ADMIN_PAGE, adminCampaignPageSchema, adminCampaignSchema, adminGiftPageSchema, CAMPAIGN_KINDS } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { isNonNullish, isNullish, omit } from 'remeda';
import { match } from 'ts-pattern';

import type { CreateCampaignActionInput, PageAtInput, StopCampaignActionInput } from '../admin.types';
import type { CampaignSales } from '../lib';

import { AppNotFoundException, AppServiceUnavailableException } from '../../../common/exceptions';
import { PrismaService } from '../../../core';
import { PromoCampaignService } from '../../promo-codes';
import { CAMPAIGN_ROW_SELECT, GIFT_ROW_SELECT } from '../config';
import { campaignExpiry, campaignView, giftView, pageWindow } from '../lib';

@Injectable()
export class AdminPromoCodesService {
  private readonly logger = new Logger(AdminPromoCodesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly campaigns: PromoCampaignService
  ) {}

  async campaignPage({ page, now }: PageAtInput): Promise<AdminCampaignPage> {
    const where = { kind: { in: [...CAMPAIGN_KINDS] } };
    const total = await this.prisma.promoCode.count({ where });
    const window = pageWindow({ page, total, size: ADMIN_PAGE.size });

    const rows = await this.prisma.promoCode.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: window.skip,
      take: window.take,
      select: CAMPAIGN_ROW_SELECT
    });

    const sales = await this.prisma.payment.groupBy({
      by: ['promoCodeId'],
      where: { promoCodeId: { in: rows.map((row) => row.id) }, status: 'succeeded' },
      _count: { _all: true },
      _sum: { amount: true }
    });

    const salesOf = (id: string): CampaignSales | undefined => {
      const row = sales.find((each) => each.promoCodeId === id);

      return row && { payments: row._count._all, revenue: row._sum.amount?.toNumber() ?? 0 };
    };

    return adminCampaignPageSchema.parse({
      items: rows.map((row) => campaignView({ row, sales: salesOf(row.id), now })).filter(isNonNullish),
      page: omit(window, ['skip', 'take'])
    });
  }

  async create({ admin, input }: CreateCampaignActionInput): Promise<AdminCampaign> {
    const base = { code: input.code, maxUses: input.maxUses, expiresAt: campaignExpiry(input.until) };

    const created = await this.campaigns.create(
      match(input.kind)
        .with('discount', () => ({ ...base, kind: 'discount' as const, percent: input.value }))
        .with('days', () => ({ ...base, kind: 'days' as const, days: input.value }))
        .exhaustive()
    );

    const view = campaignView({ row: { ...created, _count: { redemptions: 0 } }, sales: undefined, now: new Date() });

    if (isNullish(view)) {
      throw new AppServiceUnavailableException('INTERNAL_ERROR', `promo code ${created.id} is not a campaign code`);
    }

    this.logger.log(`admin ${admin.email} created campaign code ${created.code}`);

    return adminCampaignSchema.parse(view);
  }

  async stop({ admin, code, now }: StopCampaignActionInput): Promise<void> {
    const isStopped = await this.campaigns.stop({ code, now });

    if (!isStopped) {
      throw new AppNotFoundException('NOT_FOUND', 'No campaign code matches');
    }

    this.logger.log(`admin ${admin.email} stopped campaign code ${code}`);
  }

  async giftPage({ page, now }: PageAtInput): Promise<AdminGiftPage> {
    const where = { kind: 'gift' as const };
    const total = await this.prisma.promoCode.count({ where });
    const window = pageWindow({ page, total, size: ADMIN_PAGE.size });

    const rows = await this.prisma.promoCode.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: window.skip,
      take: window.take,
      select: GIFT_ROW_SELECT
    });

    return adminGiftPageSchema.parse({ items: rows.map((row) => giftView({ row, now })), page: omit(window, ['skip', 'take']) });
  }
}
