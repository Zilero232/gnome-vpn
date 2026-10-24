import { adminCsvFileSchema, adminIdParamSchema } from '@gnomevpn/schemas';
import { createZodDto } from 'nestjs-zod';

export class AdminIdParamDto extends createZodDto(adminIdParamSchema) {}

export class AdminCsvFileDto extends createZodDto(adminCsvFileSchema) {}
