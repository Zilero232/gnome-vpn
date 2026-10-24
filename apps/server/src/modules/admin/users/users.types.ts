import type { adminUserExportSchema, AdminUserFilter, adminUserQuerySchema, DeviceList } from '@gnomevpn/schemas';
import type { z } from 'zod';

import type { PrismaExecutor } from '@/core';
import type { Prisma } from '@/generated';

import type { CurrentAdminUser, GiftRow, PaymentRow } from '../shared/admin.types';
import type { USER_CARD_SELECT, USER_ROW_SELECT } from './users.config';

export type UserRow = Prisma.UserGetPayload<{ select: typeof USER_ROW_SELECT }>;

export type UserSearch =
  | { kind: 'all' }
  | { kind: 'telegramId'; id: string }
  | { kind: 'text'; text: string }
  | { kind: 'userId'; id: string }
  | { kind: 'username'; username: string };

export type UserQuery = z.output<typeof adminUserQuerySchema>;

export type UserExportQuery = z.output<typeof adminUserExportSchema>;

export type UserWhereInput = {
  search: UserExportQuery;
  now: Date;
};

export type UserFilterWhereInput = {
  filter: AdminUserFilter;
  now: Date;
  trialUserIds: string[];
};

export type CardUserRow = Prisma.UserGetPayload<{ select: typeof USER_CARD_SELECT.user }>;

export type InvitedRow = Prisma.ReferralGetPayload<{ select: typeof USER_CARD_SELECT.invited }>;

export type RedemptionRow = Prisma.PromoRedemptionGetPayload<{ select: typeof USER_CARD_SELECT.redemption }>;

export type UserCardInput = {
  user: CardUserRow;
  devices: DeviceList;
  payments: PaymentRow[];
  invited: InvitedRow[];
  invitedTotal: number;
  redemptions: RedemptionRow[];
  gifts: GiftRow[];
  now: Date;
};

export type AdminActionInput = {
  admin: CurrentAdminUser;
  userId: string;
};

export type ExtendActionInput = AdminActionInput & {
  days: number;
};

export type ExtendWithinInput = {
  userId: string;
  days: number;
  now: Date;
  db: PrismaExecutor;
};

export type RemoveDeviceActionInput = AdminActionInput & {
  deviceId: string;
};

export type MessageActionInput = AdminActionInput & {
  text: string;
};
