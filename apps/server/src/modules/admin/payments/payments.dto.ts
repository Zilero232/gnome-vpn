import { adminPaymentFilterSchema, adminPaymentPageSchema, adminPaymentQuerySchema, adminPaymentSchema } from '@gnomevpn/schemas';
import { createZodDto } from 'nestjs-zod';

export class AdminPaymentQueryDto extends createZodDto(adminPaymentQuerySchema) {}

export class AdminPaymentFilterDto extends createZodDto(adminPaymentFilterSchema) {}

export class AdminPaymentPageDto extends createZodDto(adminPaymentPageSchema) {}

export class AdminPaymentDto extends createZodDto(adminPaymentSchema) {}
