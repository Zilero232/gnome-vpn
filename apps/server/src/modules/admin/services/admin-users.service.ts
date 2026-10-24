import type { AdminCsvFile, AdminUserCard, AdminUserPage } from '@gnomevpn/schemas';

import { ADMIN_EXPORT, ADMIN_PAGE, ADMIN_USER, adminCsvFileSchema, adminUserCardSchema, adminUserPageSchema, TRIAL_DAYS } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';
import { subDays } from 'date-fns';
import { isNullish, omit } from 'remeda';

import type { Prisma } from '@/generated';

import { AppNotFoundException } from '@/common/exceptions';
import { dayKey } from '@/common/lib';
import { PrismaService } from '@/core';
import { DevicesService } from '@/modules/devices';
import { periodKind } from '@/modules/subscription';

import type { UserExportInput, UserListInput, UserLookupInput, UserWhereInput } from '../admin.types';

import {
  ADMIN_EXPORT_FILE,
  GIFT_ROW_SELECT,
  INVITED_SELECT,
  PAYMENT_ORDER,
  PAYMENT_ROW_SELECT,
  REDEMPTION_SELECT,
  USER_CARD_SELECT,
  USER_CSV_COLUMNS,
  USER_ORDER,
  USER_ROW_SELECT
} from '../config';
import { needsTrialUserIds, pageWindow, parseUserSearch, toCsv, userCard, userFilterWhere, userSearchWhere, userView } from '../lib';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly devices: DevicesService
  ) {}

  private async trialUserIds(now: Date): Promise<string[]> {
    const rows = await this.prisma.subscription.findMany({
      where: { currentPeriodEnd: { gt: now }, trialStartedAt: { gt: subDays(now, TRIAL_DAYS) } },
      select: { userId: true, currentPeriodEnd: true, trialStartedAt: true }
    });

    return rows.filter((row) => periodKind(row) === 'trial').map((row) => row.userId);
  }

  private async where({ query, filter, now }: UserWhereInput): Promise<Prisma.UserWhereInput> {
    const trialUserIds = needsTrialUserIds(filter) ? await this.trialUserIds(now) : [];

    return { AND: [userSearchWhere(parseUserSearch(query)), ...userFilterWhere({ filter, now, trialUserIds })] };
  }

  async list({ page, ...input }: UserListInput): Promise<AdminUserPage> {
    const where = await this.where(input);
    const total = await this.prisma.user.count({ where });
    const window = pageWindow({ page, total, size: ADMIN_PAGE.size });

    const rows = await this.prisma.user.findMany({
      where,
      orderBy: [...USER_ORDER],
      skip: window.skip,
      take: window.take,
      select: USER_ROW_SELECT
    });

    return adminUserPageSchema.parse({ items: rows.map(userView), page: omit(window, ['skip', 'take']) });
  }

  async exportCsv(input: UserExportInput): Promise<AdminCsvFile> {
    const { now } = input;

    const rows = await this.prisma.user.findMany({
      where: await this.where(input),
      orderBy: [...USER_ORDER],
      take: ADMIN_EXPORT.maxRows + 1,
      select: USER_ROW_SELECT
    });

    const users = rows.slice(0, ADMIN_EXPORT.maxRows).map(userView);

    return adminCsvFileSchema.parse({
      filename: `${ADMIN_EXPORT_FILE.users}-${dayKey(now)}${ADMIN_EXPORT_FILE.extension}`,
      content: toCsv({ columns: USER_CSV_COLUMNS, rows: users }),
      rows: users.length,
      isTruncated: rows.length > ADMIN_EXPORT.maxRows
    });
  }

  async card({ userId, now }: UserLookupInput): Promise<AdminUserCard> {
    const [user, devices, payments, invited, invitedTotal, redemptions, gifts] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, select: USER_CARD_SELECT }),
      this.devices.list(userId),
      this.prisma.payment.findMany({ where: { userId }, orderBy: [...PAYMENT_ORDER], take: ADMIN_USER.cardPayments, select: PAYMENT_ROW_SELECT }),
      this.prisma.referral.findMany({
        where: { referrerId: userId, referredId: { not: null } },
        orderBy: { createdAt: 'desc' },
        take: ADMIN_USER.cardInvited,
        select: INVITED_SELECT
      }),
      this.prisma.referral.count({ where: { referrerId: userId, referredId: { not: null } } }),
      this.prisma.promoRedemption.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, select: REDEMPTION_SELECT }),
      this.prisma.promoCode.findMany({ where: { buyerId: userId, kind: 'gift' }, orderBy: { createdAt: 'desc' }, select: GIFT_ROW_SELECT })
    ]);

    if (isNullish(user)) {
      throw new AppNotFoundException('NOT_FOUND', 'No such user');
    }

    return adminUserCardSchema.parse(userCard({ user, devices, payments, invited, invitedTotal, redemptions, gifts, now }));
  }
}
