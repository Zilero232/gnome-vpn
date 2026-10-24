import {
  adminCampaignCodeParamSchema,
  adminCampaignFormSchema,
  adminCampaignPageSchema,
  adminCampaignQuerySchema,
  adminCampaignSchema,
  adminGiftPageSchema,
  adminGiftQuerySchema
} from '@gnomevpn/schemas';
import { createZodDto } from 'nestjs-zod';

export class AdminCampaignQueryDto extends createZodDto(adminCampaignQuerySchema) {}

export class AdminCampaignPageDto extends createZodDto(adminCampaignPageSchema) {}

export class AdminCampaignFormDto extends createZodDto(adminCampaignFormSchema) {}

export class AdminCampaignDto extends createZodDto(adminCampaignSchema) {}

export class AdminCampaignCodeParamDto extends createZodDto(adminCampaignCodeParamSchema) {}

export class AdminGiftQueryDto extends createZodDto(adminGiftQuerySchema) {}

export class AdminGiftPageDto extends createZodDto(adminGiftPageSchema) {}
