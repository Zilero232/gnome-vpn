import {
  adminDeviceParamSchema,
  adminExtendResultSchema,
  adminExtendSchema,
  adminMessageResultSchema,
  adminMessageSchema,
  adminUserCardSchema,
  adminUserExportSchema,
  adminUserPageSchema,
  adminUserQuerySchema
} from '@gnomevpn/schemas';
import { createZodDto } from 'nestjs-zod';

export class AdminUserQueryDto extends createZodDto(adminUserQuerySchema) {}

export class AdminUserExportDto extends createZodDto(adminUserExportSchema) {}

export class AdminUserPageDto extends createZodDto(adminUserPageSchema) {}

export class AdminUserCardDto extends createZodDto(adminUserCardSchema) {}

export class AdminDeviceParamDto extends createZodDto(adminDeviceParamSchema) {}

export class AdminExtendDto extends createZodDto(adminExtendSchema) {}

export class AdminExtendResultDto extends createZodDto(adminExtendResultSchema) {}

export class AdminMessageDto extends createZodDto(adminMessageSchema) {}

export class AdminMessageResultDto extends createZodDto(adminMessageResultSchema) {}
