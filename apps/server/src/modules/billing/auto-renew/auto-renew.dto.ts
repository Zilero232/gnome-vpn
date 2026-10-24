import { bindCardResultSchema } from '@gnomevpn/schemas';
import { createZodDto } from 'nestjs-zod';

export class BindCardResultDto extends createZodDto(bindCardResultSchema) {}
