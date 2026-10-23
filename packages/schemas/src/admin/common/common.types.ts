import type { z } from 'zod';

import type {
  adminCsvFileSchema,
  adminDeviceParamSchema,
  adminIdParamSchema,
  adminPageInfoSchema,
  adminPageQuerySchema,
  adminPeriodSchema,
  adminSessionSchema,
  adminUserRefSchema
} from './common.schemas';

export type AdminSession = z.infer<typeof adminSessionSchema>;

export type AdminIdParam = z.infer<typeof adminIdParamSchema>;

export type AdminDeviceParam = z.infer<typeof adminDeviceParamSchema>;

export type AdminPeriod = z.infer<typeof adminPeriodSchema>;

export type AdminPageQuery = z.input<typeof adminPageQuerySchema>;

export type AdminPageInfo = z.infer<typeof adminPageInfoSchema>;

export type AdminUserRef = z.infer<typeof adminUserRefSchema>;

export type AdminCsvFile = z.infer<typeof adminCsvFileSchema>;
