import type { AdminPageInfo, AdminPeriod } from '@gnomevpn/schemas';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import type { Request } from 'express';

import type { Prisma } from '@/generated';

import type { ADMIN_ACTION, ROW_SELECT } from './admin.config';

export type CurrentAdminUser = {
  userId: string;
  email: string;
};

export type AdminRequest = Request & {
  session?: UserSession | null;
  admin?: CurrentAdminUser;
};

export type IsAdminInput = {
  email: string;
  emailVerified: boolean;
  admins: readonly string[];
};

export type AdminActionName = (typeof ADMIN_ACTION)[keyof typeof ADMIN_ACTION];

export type RecordAdminActionInput = {
  admin: CurrentAdminUser;
  action: AdminActionName;
  summary: string;
  targetUserId?: string | null;
  details?: Prisma.InputJsonObject;
};

export type PageWindowInput = {
  page: number;
  total: number;
  size?: number;
};

export type PageWindow = {
  info: AdminPageInfo;
  skip: number;
  take: number;
};

export type PeriodStartInput = {
  period: AdminPeriod;
  now: Date;
};

export type TotalGroup = {
  _count: { _all: number };
  _sum?: { amount?: Prisma.Decimal | null };
};

export type GroupTotalInput<Group extends TotalGroup, Key extends keyof Group> = {
  groups: Group[];
  by: Key;
  value: NoInfer<Group[Key]>;
};

export type GroupTotal = {
  count: number;
  amount: number;
};

export type CsvCell = boolean | number | string | null;

export type CsvColumn<Row> = {
  header: string;
  value: (row: Row) => CsvCell;
};

export type ToCsvInput<Row> = {
  columns: readonly CsvColumn<Row>[];
  rows: Row[];
};

export type CsvFileInput<Row> = ToCsvInput<Row> & {
  name: string;
  now: Date;
};

export type PaymentRow = Prisma.PaymentGetPayload<{ select: typeof ROW_SELECT.payment }>;

export type GiftRow = Prisma.PromoCodeGetPayload<{ select: typeof ROW_SELECT.gift }>;

export type GiftViewInput = {
  row: GiftRow;
  now: Date;
};

export type AutoRenewFlags = {
  savedCardId: string | null;
  cancelAtPeriodEnd: boolean;
};
