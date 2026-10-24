import type { AdminCampaign, AdminCampaignPage, AdminGiftPage } from '@gnomevpn/schemas';

import { ADMIN_PAGE, adminCampaignPageSchema, adminCampaignSchema, adminGiftPageSchema, CAMPAIGN_KINDS } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { isNonNullish, isNullish, omit } from 'remeda';
import { match } from 'ts-pattern';

import { AppNotFoundException, AppServiceUnavailableException } from '@/common/exceptions';
import { PrismaService } from '@/core';
import { PromoCampaignService } from '@/modules/promo-codes';

import type { CampaignPageInput, CreateCampaignActionInput, GiftPageInput, StopCampaignActionInput } from '../admin.types';

import { ADMIN_ACTION, CAMPAIGN_ROW_SELECT, GIFT_ROW_SELECT } from '../config';
import { campaignExpiry, campaignState, campaignView, giftStateWhere, giftView, groupTotal, pageWindow } from '../lib';
import { AdminAuditService } from './admin-audit.service';

@Injectable()
export class AdminPromoCodesService {
  private readonly logger = new Logger(AdminPromoCodesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly campaigns: PromoCampaignService,
    private readonly audit: AdminAuditService
  ) {}

  async campaignPage({ page, now, state, kind }: CampaignPageInput): Promise<AdminCampaignPage> {
    const campaigns = await this.prisma.promoCode.findMany({
      where: { kind: kind ?? { in: [...CAMPAIGN_KINDS] } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: CAMPAIGN_ROW_SELECT
    });

    const matching = isNullish(state)
      ? campaigns
      : campaigns.filter((row) => campaignState({ expiresAt: row.expiresAt, maxUses: row.maxUses, used: row._count.redemptions, now }) === state);

    const window = pageWindow({ page, total: matching.length, size: ADMIN_PAGE.size });
    const rows = matching.slice(window.skip, window.skip + window.take);

    const sales = await this.prisma.payment.groupBy({
      by: ['promoCodeId'],
      where: { promoCodeId: { in: rows.map((row) => row.id) }, status: 'succeeded' },
      _count: { _all: true },
      _sum: { amount: true }
    });

    return adminCampaignPageSchema.parse({
      items: rows
        .map((row) => campaignView({ row, sales: groupTotal({ groups: sales, by: 'promoCodeId', value: row.id }), now }))
        .filter(isNonNullish),
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

    await this.audit.record({
      admin,
      action: ADMIN_ACTION.createCampaign,
      details: { code: created.code, kind: input.kind, value: input.value, maxUses: input.maxUses ?? null, until: input.until ?? null }
    });

    return adminCampaignSchema.parse(view);
  }

  async stop({ admin, code, now }: StopCampaignActionInput): Promise<void> {
    const isStopped = await this.campaigns.stop({ code, now });

    if (!isStopped) {
      throw new AppNotFoundException('NOT_FOUND', 'No campaign code matches');
    }

    this.logger.log(`admin ${admin.email} stopped campaign code ${code}`);

    await this.audit.record({ admin, action: ADMIN_ACTION.stopCampaign, details: { code } });
  }

  async giftPage({ page, now, state }: GiftPageInput): Promise<AdminGiftPage> {
    const where = { kind: 'gift' as const, ...giftStateWhere({ state, now }) };
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
