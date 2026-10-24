import { adminNodeAvailabilitySchema, adminNodeListSchema, adminNodeSchema } from '@gnomevpn/schemas';
import { createZodDto } from 'nestjs-zod';

export class AdminNodeListDto extends createZodDto(adminNodeListSchema) {}

export class AdminNodeAvailabilityDto extends createZodDto(adminNodeAvailabilitySchema) {}

export class AdminNodeDto extends createZodDto(adminNodeSchema) {}
