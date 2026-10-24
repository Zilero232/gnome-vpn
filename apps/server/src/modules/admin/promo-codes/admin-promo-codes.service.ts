import type { AdminCampaign, AdminCampaignPage, AdminGiftPage } from '@gnomevpn/schemas';

import { adminCampaignPageSchema, adminCampaignSchema, adminGiftPageSchema, CAMPAIGN_KINDS } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';
import { isNonNullish, isNullish } from 'remeda';
import { match } from 'ts-pattern';

import { AppNotFoundException, AppServiceUnavailableException } from '@/common/exceptions';
import { PrismaService } from '@/core';
import { PromoCampaignService } from '@/modules/promo-codes';

import type { CampaignQuery, CreateCampaignActionInput, GiftQuery, StopCampaignActionInput } from './promo-codes.types';

import { AdminAuditService } from '../shared/admin-audit.service';
import { ADMIN_ACTION, NEWEST_FIRST, ROW_SELECT } from '../shared/admin.config';
import { groupTotal, pageWindow } from '../shared/listing.helpers';
import { giftView } from '../shared/rows.helpers';
import { CAMPAIGN_ROW_SELECT } from './promo-codes.config';
import { campaignExpiry, campaignState, campaignView, giftStateWhere } from './promo-codes.helpers';

@Injectable()
export class AdminPromoCodesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly campaigns: PromoCampaignService,
    private readonly audit: AdminAuditService
  ) {}

  async campaignPage({ page, state, kind }: CampaignQuery): Promise<AdminCampaignPage> {
    const now = new Date();

    const campaigns = await this.prisma.promoCode.findMany({
      where: { kind: kind ?? { in: [...CAMPAIGN_KINDS] } },
      orderBy: NEWEST_FIRST,
      select: CAMPAIGN_ROW_SELECT
    });

    const matching = isNullish(state)
      ? campaigns
      : campaigns.filter((row) => campaignState({ expiresAt: row.expiresAt, maxUses: row.maxUses, used: row._count.redemptions, now }) === state);

    const { info, skip, take } = pageWindow({ page, total: matching.length });
    const rows = matching.slice(skip, skip + take);

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
      page: info
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

    await this.audit.record({
      admin,
      action: ADMIN_ACTION.createCampaign,
      summary: `created campaign code ${created.code}`,
      details: { code: created.code, kind: input.kind, value: input.value, maxUses: input.maxUses ?? null, until: input.until ?? null }
    });

    return adminCampaignSchema.parse(view);
  }

  async stop({ admin, code }: StopCampaignActionInput): Promise<void> {
    const isStopped = await this.campaigns.stop({ code, now: new Date() });

    if (!isStopped) {
      throw new AppNotFoundException('NOT_FOUND', 'No campaign code matches');
    }

    await this.audit.record({ admin, action: ADMIN_ACTION.stopCampaign, summary: `stopped campaign code ${code}`, details: { code } });
  }

  async giftPage({ page, state }: GiftQuery): Promise<AdminGiftPage> {
    const now = new Date();
    const where = { kind: 'gift' as const, ...giftStateWhere({ state, now }) };
    const total = await this.prisma.promoCode.count({ where });
    const { info, skip, take } = pageWindow({ page, total });
    const rows = await this.prisma.promoCode.findMany({ where, orderBy: NEWEST_FIRST, skip, take, select: ROW_SELECT.gift });

    return adminGiftPageSchema.parse({ items: rows.map((row) => giftView({ row, now })), page: info });
  }
}
