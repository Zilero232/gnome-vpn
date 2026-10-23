import type {
  AdminAnalytics,
  AdminAnalyticsRange,
  AdminCampaign,
  AdminCampaignPage,
  AdminCreateCampaign,
  AdminCsvFile,
  AdminExtendResult,
  AdminGiftPage,
  AdminMessageResult,
  AdminNode,
  AdminNodeList,
  AdminOverview,
  AdminPayment,
  AdminPaymentFilter,
  AdminPaymentPage,
  AdminPaymentQuery,
  AdminSession,
  AdminUserCard,
  AdminUserPage,
  AdminUserQuery,
  AdminUserSearch
} from '@gnomevpn/schemas';

import type { ExtendAdminUserInput, MessageAdminUserInput, RemoveAdminDeviceInput, SetAdminNodeAvailabilityInput } from './admin.types';

import { api } from '../http';

const userPath = (id: string) => `/admin/users/${encodeURIComponent(id)}`;

export const getAdminSession = async (): Promise<AdminSession> => {
  const { data } = await api.get('/admin/me');

  return data;
};

export const getAdminOverview = async (): Promise<AdminOverview> => {
  const { data } = await api.get('/admin/overview');

  return data;
};

export const getAdminAnalytics = async (range: AdminAnalyticsRange): Promise<AdminAnalytics> => {
  const { data } = await api.get('/admin/analytics', { params: { range } });

  return data;
};

export const getAdminUsers = async (params: AdminUserQuery): Promise<AdminUserPage> => {
  const { data } = await api.get('/admin/users', { params });

  return data;
};

export const exportAdminUsers = async (params: AdminUserSearch): Promise<AdminCsvFile> => {
  const { data } = await api.get('/admin/users/export', { params });

  return data;
};

export const getAdminUser = async (id: string): Promise<AdminUserCard> => {
  const { data } = await api.get(userPath(id));

  return data;
};

export const extendAdminUser = async ({ id, days }: ExtendAdminUserInput): Promise<AdminExtendResult> => {
  const { data } = await api.post(`${userPath(id)}/extend`, { days });

  return data;
};

export const cancelAdminAutoRenew = async (id: string): Promise<void> => {
  await api.post(`${userPath(id)}/auto-renew/cancel`);
};

export const removeAdminDevice = async ({ id, deviceId }: RemoveAdminDeviceInput): Promise<void> => {
  await api.delete(`${userPath(id)}/devices/${encodeURIComponent(deviceId)}`);
};

export const messageAdminUser = async ({ id, text }: MessageAdminUserInput): Promise<AdminMessageResult> => {
  const { data } = await api.post(`${userPath(id)}/message`, { text });

  return data;
};

export const verifyAdminEmail = async (id: string): Promise<void> => {
  await api.post(`${userPath(id)}/verify-email`);
};

export const rotateAdminLink = async (id: string): Promise<void> => {
  await api.post(`${userPath(id)}/link/rotate`);
};

export const getAdminPayments = async (params: AdminPaymentQuery): Promise<AdminPaymentPage> => {
  const { data } = await api.get('/admin/payments', { params });

  return data;
};

export const exportAdminPayments = async (params: AdminPaymentFilter): Promise<AdminCsvFile> => {
  const { data } = await api.get('/admin/payments/export', { params });

  return data;
};

export const refundAdminPayment = async (id: string): Promise<AdminPayment> => {
  const { data } = await api.post(`/admin/payments/${encodeURIComponent(id)}/refund`);

  return data;
};

export const getAdminCampaigns = async (page: number): Promise<AdminCampaignPage> => {
  const { data } = await api.get('/admin/promo-codes', { params: { page } });

  return data;
};

export const createAdminCampaign = async (input: AdminCreateCampaign): Promise<AdminCampaign> => {
  const { data } = await api.post('/admin/promo-codes', input);

  return data;
};

export const stopAdminCampaign = async (code: string): Promise<void> => {
  await api.post(`/admin/promo-codes/${encodeURIComponent(code)}/stop`);
};

export const getAdminGifts = async (page: number): Promise<AdminGiftPage> => {
  const { data } = await api.get('/admin/gifts', { params: { page } });

  return data;
};

export const getAdminNodes = async (): Promise<AdminNodeList> => {
  const { data } = await api.get('/admin/nodes');

  return data;
};

export const setAdminNodeAvailability = async ({ id, isAvailable }: SetAdminNodeAvailabilityInput): Promise<AdminNode> => {
  const { data } = await api.patch(`/admin/nodes/${encodeURIComponent(id)}`, { isAvailable });

  return data;
};
