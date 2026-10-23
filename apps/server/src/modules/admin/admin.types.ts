import type { AdminAnalyticsRange, AdminCreateCampaign } from '@gnomevpn/schemas';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import type { Request } from 'express';

import type { Prisma } from '../../../generated';
import type { PrismaExecutor } from '../../core';
import type { STATS_NODE_SELECT } from './config';
import type { PaymentFilter, SubscriptionTally } from './lib';

export type CurrentAdminUser = {
  userId: string;
  email: string;
};

export type AdminRequest = Request & {
  session?: UserSession | null;
  admin?: CurrentAdminUser;
};

export type StatsNodeRow = Prisma.NodeGetPayload<{ select: typeof STATS_NODE_SELECT }>;

export type StatsSnapshot = {
  users: {
    total: number;
    day: number;
    week: number;
  };
  subscriptions: SubscriptionTally;
  payments: {
    days: number;
    count: number;
    amount: number;
  };
  devices: number;
  chats: number;
  nodes: StatsNodeRow[];
};

export type DaysInput = {
  start: Date;
  days: number;
};

export type PaymentDayRow = {
  day: string;
  payments: number;
  revenue: number;
};

export type ConversionRow = {
  trials: number;
  converted: number;
};

export type AnalyticsInput = {
  range: AdminAnalyticsRange;
  now: Date;
};

export type UserListInput = {
  page: number;
  query: string;
};

export type UserExportInput = {
  query: string;
  now: Date;
};

export type UserLookupInput = {
  userId: string;
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

export type PaymentListInput = PaymentFilter & {
  page: number;
  now: Date;
};

export type PaymentExportInput = PaymentFilter & {
  now: Date;
};

export type RefundActionInput = {
  admin: CurrentAdminUser;
  paymentId: string;
};

export type PageAtInput = {
  page: number;
  now: Date;
};

export type CreateCampaignActionInput = {
  admin: CurrentAdminUser;
  input: AdminCreateCampaign;
};

export type StopCampaignActionInput = {
  admin: CurrentAdminUser;
  code: string;
  now: Date;
};

export type SetAvailabilityInput = {
  admin: CurrentAdminUser;
  nodeId: string;
  isAvailable: boolean;
  now: Date;
};
