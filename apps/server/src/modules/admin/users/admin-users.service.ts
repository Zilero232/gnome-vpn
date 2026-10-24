import type { AdminCsvFile, AdminUserCard, AdminUserPage } from '@gnomevpn/schemas';

import { ADMIN_EXPORT, ADMIN_USER, adminCsvFileSchema, adminUserCardSchema, adminUserPageSchema, TRIAL_DAYS } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';
import { subDays } from 'date-fns';

import type { Prisma } from '@/generated';

import { PrismaService } from '@/core';
import { DevicesService } from '@/modules/devices';
import { periodKind } from '@/modules/subscription';

import type { UserExportQuery, UserQuery, UserWhereInput } from './users.types';

import { NEWEST_FIRST, ROW_SELECT } from '../shared/admin.config';
import { csvFile, pageWindow } from '../shared/listing.helpers';
import { userCard } from './user-card.helpers';
import { USER_CARD_SELECT, USER_EXPORT, USER_ROW_SELECT } from './users.config';
import { needsTrialUserIds, parseUserSearch, userFilterWhere, userSearchWhere, userView } from './users.helpers';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly devices: DevicesService
  ) {}

  async list({ page, ...search }: UserQuery): Promise<AdminUserPage> {
    const where = await this.where({ search, now: new Date() });
    const total = await this.prisma.user.count({ where });
    const { info, skip, take } = pageWindow({ page, total });
    const rows = await this.prisma.user.findMany({ where, orderBy: NEWEST_FIRST, skip, take, select: USER_ROW_SELECT });

    return adminUserPageSchema.parse({ items: rows.map(userView), page: info });
  }

  async exportCsv(search: UserExportQuery): Promise<AdminCsvFile> {
    const now = new Date();

    const rows = await this.prisma.user.findMany({
      where: await this.where({ search, now }),
      orderBy: NEWEST_FIRST,
      take: ADMIN_EXPORT.maxRows + 1,
      select: USER_ROW_SELECT
    });

    return adminCsvFileSchema.parse(csvFile({ name: USER_EXPORT.file, columns: USER_EXPORT.columns, rows: rows.map(userView), now }));
  }

  async card(userId: string): Promise<AdminUserCard> {
    const [user, devices, payments, invited, invitedTotal, redemptions, gifts] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: USER_CARD_SELECT.user }),
      this.devices.list(userId),
      this.prisma.payment.findMany({ where: { userId }, orderBy: NEWEST_FIRST, take: ADMIN_USER.cardPayments, select: ROW_SELECT.payment }),
      this.prisma.referral.findMany({
        where: { referrerId: userId, referredId: { not: null } },
        orderBy: { createdAt: 'desc' },
        take: ADMIN_USER.cardInvited,
        select: USER_CARD_SELECT.invited
      }),
      this.prisma.referral.count({ where: { referrerId: userId, referredId: { not: null } } }),
      this.prisma.promoRedemption.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, select: USER_CARD_SELECT.redemption }),
      this.prisma.promoCode.findMany({ where: { buyerId: userId, kind: 'gift' }, orderBy: { createdAt: 'desc' }, select: ROW_SELECT.gift })
    ]);

    return adminUserCardSchema.parse(userCard({ user, devices, payments, invited, invitedTotal, redemptions, gifts, now: new Date() }));
  }

  private async where({ search: { query, ...filter }, now }: UserWhereInput): Promise<Prisma.UserWhereInput> {
    const trialUserIds = needsTrialUserIds(filter) ? await this.trialUserIds(now) : [];

    return { AND: [userSearchWhere(parseUserSearch(query)), ...userFilterWhere({ filter, now, trialUserIds })] };
  }

  private async trialUserIds(now: Date): Promise<string[]> {
    const rows = await this.prisma.subscription.findMany({
      where: { currentPeriodEnd: { gt: now }, trialStartedAt: { gt: subDays(now, TRIAL_DAYS) } },
      select: { userId: true, currentPeriodEnd: true, trialStartedAt: true }
    });

    return rows.filter((row) => periodKind(row) === 'trial').map((row) => row.userId);
  }
}
