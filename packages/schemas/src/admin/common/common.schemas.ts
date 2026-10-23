import { z } from 'zod';

import { ADMIN_ID, ADMIN_PAGE, ADMIN_PERIODS } from './common.constants';

export const adminCountSchema = z.number().int().nonnegative();

export const adminAmountSchema = z.number().nonnegative();

export const adminSessionSchema = z.object({
  email: z.string()
});

const adminIdSchema = z.string().min(1).max(ADMIN_ID.maxLength);

export const adminIdParamSchema = z.object({
  id: adminIdSchema
});

export const adminDeviceParamSchema = z.object({
  id: adminIdSchema,
  deviceId: z.uuid()
});

export const adminPeriodSchema = z.enum(ADMIN_PERIODS);

export const adminPageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(ADMIN_PAGE.maxPage).default(1)
});

export const adminPageInfoSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: adminCountSchema,
  pages: z.number().int().positive()
});

export const adminUserRefSchema = z.object({
  id: z.string(),
  email: z.string()
});

export const adminCsvFileSchema = z.object({
  filename: z.string(),
  content: z.string(),
  rows: adminCountSchema,
  isTruncated: z.boolean()
});
