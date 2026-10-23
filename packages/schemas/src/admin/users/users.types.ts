import type { z } from 'zod';

import type {
  adminExtendResultSchema,
  adminExtendSchema,
  adminMessageResultSchema,
  adminMessageSchema,
  adminRedemptionSchema,
  adminReferralSchema,
  adminTelegramSchema,
  adminUserCardSchema,
  adminUserPageSchema,
  adminUserQuerySchema,
  adminUserSchema,
  adminUserSearchSchema
} from './users.schemas';

export type AdminUserSearch = z.input<typeof adminUserSearchSchema>;

export type AdminUserQuery = z.input<typeof adminUserQuerySchema>;

export type AdminTelegram = z.infer<typeof adminTelegramSchema>;

export type AdminUser = z.infer<typeof adminUserSchema>;

export type AdminUserPage = z.infer<typeof adminUserPageSchema>;

export type AdminReferral = z.infer<typeof adminReferralSchema>;

export type AdminRedemption = z.infer<typeof adminRedemptionSchema>;

export type AdminUserCard = z.infer<typeof adminUserCardSchema>;

export type AdminExtendInput = z.infer<typeof adminExtendSchema>;

export type AdminExtendResult = z.infer<typeof adminExtendResultSchema>;

export type AdminMessageInput = z.infer<typeof adminMessageSchema>;

export type AdminMessageResult = z.infer<typeof adminMessageResultSchema>;

export type AdminMessageOutcome = AdminMessageResult['outcome'];
