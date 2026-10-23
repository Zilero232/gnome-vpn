import {
  adminAnalyticsQuerySchema,
  adminAnalyticsSchema,
  adminCampaignCodeParamSchema,
  adminCampaignFormSchema,
  adminCampaignPageSchema,
  adminCampaignQuerySchema,
  adminCampaignSchema,
  adminCsvFileSchema,
  adminDeviceParamSchema,
  adminExtendResultSchema,
  adminExtendSchema,
  adminGiftPageSchema,
  adminGiftQuerySchema,
  adminIdParamSchema,
  adminMessageResultSchema,
  adminMessageSchema,
  adminNodeAvailabilitySchema,
  adminNodeListSchema,
  adminNodeSchema,
  adminOverviewSchema,
  adminPaymentFilterSchema,
  adminPaymentPageSchema,
  adminPaymentQuerySchema,
  adminPaymentSchema,
  adminSessionSchema,
  adminUserCardSchema,
  adminUserExportSchema,
  adminUserPageSchema,
  adminUserQuerySchema
} from '@gnomevpn/schemas';
import { createZodDto } from 'nestjs-zod';

export class AdminSessionDto extends createZodDto(adminSessionSchema) {}

export class AdminOverviewDto extends createZodDto(adminOverviewSchema) {}

export class AdminAnalyticsQueryDto extends createZodDto(adminAnalyticsQuerySchema) {}

export class AdminAnalyticsDto extends createZodDto(adminAnalyticsSchema) {}

export class AdminIdParamDto extends createZodDto(adminIdParamSchema) {}

export class AdminDeviceParamDto extends createZodDto(adminDeviceParamSchema) {}

export class AdminCampaignQueryDto extends createZodDto(adminCampaignQuerySchema) {}

export class AdminGiftQueryDto extends createZodDto(adminGiftQuerySchema) {}

export class AdminCsvFileDto extends createZodDto(adminCsvFileSchema) {}

export class AdminUserQueryDto extends createZodDto(adminUserQuerySchema) {}

export class AdminUserExportDto extends createZodDto(adminUserExportSchema) {}

export class AdminUserPageDto extends createZodDto(adminUserPageSchema) {}

export class AdminUserCardDto extends createZodDto(adminUserCardSchema) {}

export class AdminExtendDto extends createZodDto(adminExtendSchema) {}

export class AdminExtendResultDto extends createZodDto(adminExtendResultSchema) {}

export class AdminMessageDto extends createZodDto(adminMessageSchema) {}

export class AdminMessageResultDto extends createZodDto(adminMessageResultSchema) {}

export class AdminPaymentQueryDto extends createZodDto(adminPaymentQuerySchema) {}

export class AdminPaymentFilterDto extends createZodDto(adminPaymentFilterSchema) {}

export class AdminPaymentPageDto extends createZodDto(adminPaymentPageSchema) {}

export class AdminPaymentDto extends createZodDto(adminPaymentSchema) {}

export class AdminCampaignCodeParamDto extends createZodDto(adminCampaignCodeParamSchema) {}

export class AdminCampaignFormDto extends createZodDto(adminCampaignFormSchema) {}

export class AdminCampaignPageDto extends createZodDto(adminCampaignPageSchema) {}

export class AdminCampaignDto extends createZodDto(adminCampaignSchema) {}

export class AdminGiftPageDto extends createZodDto(adminGiftPageSchema) {}

export class AdminNodeListDto extends createZodDto(adminNodeListSchema) {}

export class AdminNodeAvailabilityDto extends createZodDto(adminNodeAvailabilitySchema) {}

export class AdminNodeDto extends createZodDto(adminNodeSchema) {}
